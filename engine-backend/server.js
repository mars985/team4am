import http from "http"
import { Server } from "socket.io"
import app from "./src/app.js"
import registerGameSocket from "./src/sockets/game.socket.js"
import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()

const MONGO_URL = process.env.MONGO_URL
const JWT_SECRET = process.env.JWT_SECRET
if (!MONGO_URL) {
  console.error("MONGO_URL missing from environment")
  process.exit(1)
}

if (!JWT_SECRET) {
  console.error("JWT_SECRET missing from environment")
  process.exit(1)
}

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB")

    const server = http.createServer(app)

    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_BASE_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    })
    registerGameSocket(io)

    const PORT = process.env.PORT || 4510
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err)
    process.exit(1)
  })