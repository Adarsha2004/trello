import "dotenv/config";
import { WebSocketServer } from "ws";
import type { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";
import { auth } from "@repo/auth/server";

const server = new WebSocketServer({ port: Number(process.env.WS_PORT ?? 8080) });

interface BoardUser {
  id: string;
  name: string;
  image: string | null;
  ws: WebSocket;
}

// boardId -> connected users
const USERS: Record<string, BoardUser[]> = {};

function broadcast(boardId: string, message: unknown, exclude?: WebSocket) {
  const payload = JSON.stringify(message);
  USERS[boardId]?.forEach((user) => {
    if (user.ws !== exclude && user.ws.readyState === user.ws.OPEN) {
      user.ws.send(payload);
    }
  });
}

// Validate the Better Auth session cookie from the handshake headers.
async function getSessionUser(req: IncomingMessage) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    return session
      ? { id: session.user.id, name: session.user.name, image: session.user.image ?? null }
      : null;
  } catch {
    return null;
  }
}

server.on("connection", (socket, req) => {
  // Resolve the session asynchronously; gate message handling on it so a
  // client that sends "join" immediately isn't dropped while we query the DB.
  let user: { id: string; name: string; image: string | null } | null = null;
  const ready = getSessionUser(req).then((sessionUser) => {
    user = sessionUser;
    if (!sessionUser) {
      socket.close(4401, "Unauthorized");
    }
    return sessionUser;
  });

  socket.on("message", async (data) => {
    await ready;
    if (!user) return;

    let parsed: {
      type?: string;
      boardId?: string;
      issueId?: string;
      targetSectionId?: string;
      newKey?: string;
      scope?: string;
    };
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (parsed.type === "join" && parsed.boardId) {
      const { boardId } = parsed;
      const { id, name, image } = user;

      if (!USERS[boardId]) {
        USERS[boardId] = [];
      }

      // Tell everyone else about the new user
      broadcast(boardId, { type: "join", userId: id, name, image }, socket);

      USERS[boardId]!.push({ id, name, image, ws: socket });

      const others = new Map(
        USERS[boardId]!.filter((u) => u.id !== id).map((u) => [u.id, { id: u.id, name: u.name, image: u.image }]),
      );
      socket.send(JSON.stringify({ type: "initial_state", users: [...others.values()] }));
    }

    // When a user drops an issue (completed move), relay to everyone else
    // on the same board so their boards update in real-time.
    if (
      parsed.type === "move_issue" &&
      parsed.boardId &&
      parsed.issueId &&
      parsed.targetSectionId &&
      parsed.newKey
    ) {
      broadcast(
        parsed.boardId,
        {
          type: "move_issue",
          issueId: parsed.issueId,
          targetSectionId: parsed.targetSectionId,
          newKey: parsed.newKey,
        },
        socket,
      );
    }

    // When an issue or section is created, updated, or deleted, notify
    // other users on the same board so they can refetch and stay in sync.
    if (parsed.type === "board_updated" && parsed.boardId) {
      broadcast(
        parsed.boardId,
        {
          type: "board_updated",
          scope: parsed.scope ?? "issues",
        },
        socket,
      );
    }
  });

  socket.on("close", () => {
    for (const [boardId, users] of Object.entries(USERS)) {
      const index = users.findIndex((u) => u.ws === socket);
      if (index === -1) continue;

      const left = users[index]!;
      users.splice(index, 1);

      // Only broadcast leave when the user's last socket for this board closed
      const stillConnected = users.some((u) => u.id === left.id);
      if (!stillConnected && users.length === 0) {
        delete USERS[boardId];
      }
      if (!stillConnected) {
        broadcast(boardId, { type: "leave", userId: left.id });
      }
    }
  });
});
