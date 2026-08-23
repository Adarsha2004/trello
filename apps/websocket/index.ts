import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

const server = new WebSocketServer({ port: 8080 });

interface BoardUser {
  id: string;
  name: string;
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

server.on("connection", (socket) => {
  socket.on("message", (data) => {
    let parsed: { type?: string; boardId?: string; id?: string; name?: string };
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (parsed.type === "join" && parsed.boardId && parsed.id && parsed.name) {
      const { boardId, id, name } = parsed;

      if (!USERS[boardId]) {
        USERS[boardId] = [];
      }

      // Tell everyone else about the new user
      broadcast(boardId, { type: "join", userId: id, name }, socket);

      // Same user in another tab: replace the stale connection
      USERS[boardId] = USERS[boardId].filter((user) => user.id !== id);
      USERS[boardId].push({ id, name, ws: socket });

      socket.send(
        JSON.stringify({
          type: "initial_state",
          users: USERS[boardId].filter((user) => user.id !== id).map(({ id, name }) => ({ id, name })),
        }),
      );
    }
  });

  socket.on("close", () => {
    for (const [boardId, users] of Object.entries(USERS)) {
      const index = users.findIndex((user) => user.ws === socket);
      if (index === -1) continue;

      const left = users[index]!;
      users.splice(index, 1);
      if (users.length === 0) {
        delete USERS[boardId];
      }

      broadcast(boardId, { type: "leave", userId: left.id });
    }
  });
});
