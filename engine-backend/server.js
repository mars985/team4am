import http from "http"
import { Server } from "socket.io"
import app from "./src/app.js"
import registerGameSocket from "./src/sockets/game.socket.js"

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
registerGameSocket(io)

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});