import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

const server = new WebSocketServer({ port: 8080 });

const USERS: Record<string, { id: string, ws: WebSocket }[]> = {
  //board1 : [{id:1,ws:ws1},{id:2,ws:ws2}]
}

server.on("connection", (socket) => {
  socket.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());
    if (parsedData.type === "join") {
      const boardId = parsedData.boardId;
      const newUserId = parsedData.id

      if (!USERS[boardId]) {
        USERS[boardId] = [];
      }
      
      USERS[boardId].forEach(({ ws }) =>
        ws.send(JSON.stringify({
          type: "join",
          userId: newUserId
        }))
      )

      USERS[boardId].push({ id: newUserId, ws: socket });

      socket.send(JSON.stringify({
        type: "initial_state",
        users: USERS[boardId].filter(x => x.id !== newUserId).map(u => u.id)
      }))
    }
  })

  socket.on("close", () => {
    Object.entries(USERS).map(([boardId, users]) => {
      const userExists = users.find(u => u.ws === socket);
      if (userExists) {
        users = users.filter(x => x.ws !== socket);
        users.forEach(({ ws }) =>
          ws.send(JSON.stringify({
            type: "leave",
            userId: userExists.id
          }))
        )
      }
    })
  })
})