import http from "http"
import { Server } from "socket.io"
import app from "./src/app.js"
import registerGameSocket from "./src/sockets/game.socket.js"

const server = http.createServer(app)

const io = new Server(server,{
  cors:{origin:"*"}
})

registerGameSocket(io)

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});