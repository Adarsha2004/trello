import { useEffect, useRef, useState } from "react";

export interface PresenceUser {
  id: string;
  name: string;
}

// Local dev: talk straight to the WS server. Everywhere else (cluster): same-origin, ingress routes /ws.
const WS_URL =
  window.location.hostname === "localhost" ? "ws://localhost:8080" : `wss://${window.location.host}/ws`;

/**
 * Joins the board room over WebSocket and tracks who is currently present.
 * The local user is included in the returned list.
 */
export function useBoardPresence(boardId: string | undefined, me: PresenceUser | null) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [connected, setConnected] = useState(false);
  const meRef = useRef(me);
  meRef.current = me;

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

      socket.onopen = () => {
        retry = 0;
        setConnected(true);
        socket?.send(
          JSON.stringify({ type: "join", boardId, id: meRef.current?.id, name: meRef.current?.name }),
        );
      };

      socket.onmessage = (event) => {
        let message: { type?: string; userId?: string; name?: string; users?: PresenceUser[] };
        try {
          message = JSON.parse(event.data as string);
        } catch {
          return;
        }

        if (message.type === "initial_state" && Array.isArray(message.users)) {
          setUsers(message.users);
        } else if (message.type === "join" && message.userId && message.name) {
          const { userId, name } = message;
          setUsers((prev) =>
            prev.some((user) => user.id === userId) ? prev : [...prev, { id: userId, name }],
          );
        } else if (message.type === "leave" && message.userId) {
          const { userId } = message;
          setUsers((prev) => prev.filter((user) => user.id !== userId));
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (!closed) {
          retryTimer = setTimeout(connect, Math.min(1000 * 2 ** retry++, 8000));
        }
      };
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(retryTimer);
      socket?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, me?.id]);

  return { users, connected };
}
