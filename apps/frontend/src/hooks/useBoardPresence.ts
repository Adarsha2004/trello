import { useCallback, useEffect, useRef, useState } from "react";
import type { MoveIssueAction } from "@/lib/dnd";

export interface PresenceUser {
  id: string;
  name: string;
  image?: string | null;
}

// Local dev: talk straight to the WS server. Everywhere else (cluster): same-origin, ingress routes /ws.
const WS_URL =
  window.location.hostname === "localhost" ? "ws://localhost:8080" : `wss://${window.location.host}/ws`;

interface UseBoardPresenceOptions {
  /** Called when another user drops an issue on their board. */
  onMoveIssue?: (action: MoveIssueAction) => void;
  /** Called when another user updates, creates, or deletes an issue/section. */
  onBoardUpdate?: (scope: "issues" | "sections" | "all") => void;
}

/**
 * Joins the board room over WebSocket and tracks who is currently present.
 * The local user is included in the returned list.
 *
 * Also relays real-time board mutations (issue moves, card edits, etc.) between peers.
 */
export function useBoardPresence(
  boardId: string | undefined,
  me: PresenceUser | null,
  options?: UseBoardPresenceOptions,
) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [connected, setConnected] = useState(false);
  const meRef = useRef(me);
  meRef.current = me;

  // Keep callback refs up-to-date without re-triggering the effect.
  const onMoveIssueRef = useRef(options?.onMoveIssue);
  onMoveIssueRef.current = options?.onMoveIssue;
  const onBoardUpdateRef = useRef(options?.onBoardUpdate);
  onBoardUpdateRef.current = options?.onBoardUpdate;

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!boardId || !me) return;
    setUsers([]);
    setConnected(false);

    let socket: WebSocket | null = null;
    let closed = false;
    let retry = 0;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        retry = 0;
        setConnected(true);
        // Identity comes from the session cookie validated on the handshake.
        socket?.send(JSON.stringify({ type: "join", boardId }));
      };

      socket.onmessage = (event) => {
        let message: {
          type?: string;
          userId?: string;
          name?: string;
          image?: string | null;
          users?: PresenceUser[];
          issueId?: string;
          targetSectionId?: string;
          newKey?: string;
          scope?: "issues" | "sections" | "all";
        };
        try {
          message = JSON.parse(event.data as string);
        } catch {
          return;
        }

        if (message.type === "initial_state" && Array.isArray(message.users)) {
          setUsers(message.users);
        } else if (message.type === "join" && message.userId && message.name) {
          const { userId, name, image } = message;
          setUsers((prev) =>
            prev.some((user) => user.id === userId) ? prev : [...prev, { id: userId, name, image }],
          );
        } else if (message.type === "leave" && message.userId) {
          const { userId } = message;
          setUsers((prev) => prev.filter((user) => user.id !== userId));
        } else if (
          message.type === "move_issue" &&
          message.issueId &&
          message.targetSectionId &&
          message.newKey
        ) {
          onMoveIssueRef.current?.({
            issueId: message.issueId,
            targetSectionId: message.targetSectionId,
            newKey: message.newKey,
          });
        } else if (message.type === "board_updated") {
          onBoardUpdateRef.current?.(message.scope ?? "issues");
        }
      };

      socket.onclose = (event) => {
        socketRef.current = null;
        setConnected(false);
        // 4401 = session invalid/expired: retrying won't help.
        if (!closed && event.code !== 4401) {
          retryTimer = setTimeout(connect, Math.min(1000 * 2 ** retry++, 8000));
        }
      };
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(retryTimer);
      socketRef.current = null;
      socket?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, me?.id]);

  /** Send a JSON message through the board WebSocket (fire-and-forget). */
  const sendMessage = useCallback((message: Record<string, unknown>) => {
    const ws = socketRef.current;
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, []);

  return { users, connected, sendMessage };
}
