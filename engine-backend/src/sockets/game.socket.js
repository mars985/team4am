import { createGame, getGame, gameExists } from "../services/gameState.service.js"
import { updateLeaderboard } from "../services/leaderboard.service.js"

export default function registerGameSocket(io) {

  io.on("connection", socket => {
    console.log("Client connected:", socket.id)

    socket.on("join-game", ({ roomId, type, playerId, gridSize, playerName }) => {
      console.log(`Player ${playerId} joining room ${roomId} for game ${type}`)

      socket.join(roomId)

      if (!gameExists(roomId)) {
        createGame(roomId, type, gridSize)
      }

      const game = getGame(roomId)

      if (type === "strands") {
        game.engine.addPlayer(playerId, playerName)
      }

      if (type === "dots") {
        // Check if player already exists in the game
        if (!game.engine.state.players[playerId]) {
          // Assign player numbers (1 or 2) based on how many players are in the room
          const playersInRoom = Object.keys(game.engine.state.players).length
          const playerNumber = playersInRoom === 0 ? 1 : 2
          game.engine.addPlayer(playerId, playerNumber, playerName)
          
          // Notify player of their assignment
          socket.emit("player-assigned", { 
            playerNumber, 
            color: playerNumber === 1 ? "blue" : "red" 
          })
        } else {
          // Player already exists, send their existing assignment
          const existingPlayer = game.engine.state.players[playerId]
          socket.emit("player-assigned", { 
            playerNumber: existingPlayer.playerNumber, 
            color: existingPlayer.color
          })
        }
      }

      io.to(roomId).emit("game-state", game.engine.getState())
    })

    socket.on("player-move", async ({ roomId, data }) => {
      const game = getGame(roomId)

      if (!game) return

      if (game.type === "dots") {
        const result = game.engine.handleMove(data.playerId, data.edge)
        
        if(!result.success){
          socket.emit("move-error", { message: result.message })
          return
        }

        // Update leaderboard if game is over
        if(game.engine.state.gameOver){
          const winner = game.engine.state.winner
          if(winner !== "tie"){
            const winnerPlayerId = Object.keys(game.engine.state.players)
              .find(pid => game.engine.state.players[pid].playerNumber === winner)
            
            if(winnerPlayerId){
              updateLeaderboard(game.type, winnerPlayerId, game.engine.state.scores[winner])
            }
          }
        }

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

      if (game && game.type === "dots") {
        game.engine.resetGame()
        io.to(roomId).emit("game-state", game.engine.getState())
      }
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

}