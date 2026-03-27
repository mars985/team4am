import express from "express"
import cors from "cors"
import gameRoutes from "./routes/game.routes.js"
import leaderboardRoutes from "./routes/leaderboard.routes.js"
import authRoutes from "./routes/authRoutes.js"
import dotenv from 'dotenv';

dotenv.config();

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_BASE_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))
app.use(express.json())

app.use("/api/game", gameRoutes)
app.use("/api/leaderboard", leaderboardRoutes)
app.use("/api/auth", authRoutes)
app.use("/auth", authRoutes) // alias path for legacy frontend calls

export default app