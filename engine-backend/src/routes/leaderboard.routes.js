import express from "express"
import { getLeaderboard } from "../services/leaderboard.service.js"

const router = express.Router()

router.get("/:gameType",(req,res)=>{

  const gameType = req.params.gameType

  const leaderboard = getLeaderboard(gameType)

  res.json(leaderboard)

})

export default router