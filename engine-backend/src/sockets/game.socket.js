import { createGame, getGame, gameExists } from "../services/gameState.service.js"
import { updateLeaderboard } from "../services/leaderboard.service.js"

export default function registerGameSocket(io) {

  io.on("connection", socket => {
    console.log("Client connected:", socket.id)

    socket.on("join-game", ({ roomId, type, playerId }) => {
      console.log(`Player ${playerId} joining room ${roomId} for game ${type}`)

      socket.join(roomId)

      if (!gameExists(roomId)) {
        createGame(roomId, type)
      }

      const game = getGame(roomId)

      if (type === "strands") {
        game.engine.addPlayer(playerId)
      }

      io.to(roomId).emit("game-state", game.engine.getState())
    })

    socket.on("player-move", async ({ roomId, data }) => {
      const game = getGame(roomId)

      if (!game) return

      if (game.type === "dots") {
        game.engine.handleMove(data)
        io.to(roomId).emit("game-state", game.engine.getState())
      }

      if (game.type === "strands") {
        // Await the async word validation
        const result = await game.engine.submitWord(
          data.playerId, 
          data.word, 
          data.selectedIndices
        )

        // Send validation result back to the player
        socket.emit("word-validation", result)

        if(result.success){
          const player = game.engine.state.players[data.playerId]
          updateLeaderboard(game.type, data.playerId, player.score)
        }

        io.to(roomId).emit("game-state", game.engine.getState())
      }
    })

    socket.on("reset-board", ({ roomId }) => {
      const game = getGame(roomId)
      if (game && game.type === "strands") {
        game.engine.resetBoard()
        io.to(roomId).emit("game-state", game.engine.getState())
      }
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

}