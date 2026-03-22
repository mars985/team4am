import express from "express"
import cors from "cors"
import gameRoutes from "./routes/game.routes.js"
import leaderboardRoutes from "./routes/leaderboard.routes.js"
import dotenv from 'dotenv';

dotenv.config();

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
}))
app.use(express.json())

app.use("/api/game",gameRoutes)
app.use("/api/leaderboard", leaderboardRoutes)

export default app