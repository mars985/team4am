import { createGame, getGame, gameExists } from "../services/gameState.service.js"
import { updateLeaderboard } from "../services/leaderboard.service.js"

// Store timer intervals for each room
const roomTimers = {}

export default function registerGameSocket(io) {

  io.on("connection", socket => {
    console.log("Client connected:", socket.id)

    socket.on("join-game", ({ roomId, type, playerId, gridSize, playerName }) => {
      console.log(`Player ${playerId} joining room ${roomId} for game ${type}`)

      // Store playerId in socket data for disconnect tracking
      socket.data = { playerId, roomId, type }
      
      socket.join(roomId)

      if (!gameExists(roomId)) {
        createGame(roomId, type, gridSize)
        
        // Start timer broadcast for strands games
        if (type === "strands" && !roomTimers[roomId]) {
          roomTimers[roomId] = setInterval(() => {
            const game = getGame(roomId)
            if (game && game.type === "strands") {
              const timeRemaining = game.engine.getTimeRemaining()
              const state = game.engine.getState()
              state.timeRemaining = timeRemaining
              state.gameEnded = game.engine.state.gameEnded
              
              io.to(roomId).emit("timer-update", { timeRemaining, gameEnded: state.gameEnded })
              
              // Stop timer if game ended
              if (state.gameEnded && roomTimers[roomId]) {
                clearInterval(roomTimers[roomId])
                delete roomTimers[roomId]
              }
            }
          }, 1000) // Update every second
        }
      }

      const game = getGame(roomId)

      if (type === "strands") {
        // Check if player already exists
        if (!game.engine.state.players[playerId]) {
          game.engine.addPlayer(playerId, playerName)
        }
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

      const state = game.engine.getState()
      
      // Add time remaining for strands
      if (type === "strands") {
        state.timeRemaining = game.engine.getTimeRemaining()
        state.gameEnded = game.engine.state.gameEnded
      }
      
      io.to(roomId).emit("game-state", state)
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

        // Send updated state with time remaining
        const state = game.engine.getState()
        state.timeRemaining = game.engine.getTimeRemaining()
        state.gameEnded = game.engine.state.gameEnded
        io.to(roomId).emit("game-state", state)
      }
    })

    socket.on("reset-board", ({ roomId }) => {
      const game = getGame(roomId)
      
      if (game && game.type === "strands") {
        game.engine.resetBoard()
        
        // Restart timer for strands
        if (roomTimers[roomId]) {
          clearInterval(roomTimers[roomId])
        }
        
        roomTimers[roomId] = setInterval(() => {
          const game = getGame(roomId)
          if (game && game.type === "strands") {
            const timeRemaining = game.engine.getTimeRemaining()
            const state = game.engine.getState()
            state.timeRemaining = timeRemaining
            state.gameEnded = game.engine.state.gameEnded
            
            io.to(roomId).emit("timer-update", { timeRemaining, gameEnded: state.gameEnded })
            
            // Stop timer if game ended
            if (state.gameEnded && roomTimers[roomId]) {
              clearInterval(roomTimers[roomId])
              delete roomTimers[roomId]
            }
          }
        }, 1000)
        
        const state = game.engine.getState()
        state.timeRemaining = game.engine.getTimeRemaining()
        state.gameEnded = game.engine.state.gameEnded
        io.to(roomId).emit("game-state", state)
      }

      if (game && game.type === "dots") {
        game.engine.resetGame()
        io.to(roomId).emit("game-state", game.engine.getState())
      }
    })

    socket.on("leave-game", ({ roomId, playerId, playerName }) => {
      console.log(`Player ${playerId} leaving room ${roomId}`)
      
      const game = getGame(roomId)
      if (game && Object.keys(game.engine.state.players).length > 1) {
        // End the game if it's Join the Dots
        if (game.type === "dots" && !game.engine.state.gameOver) {
          game.engine.endGamePlayerLeft(playerId)
        }
        
        // Notify other players
        socket.to(roomId).emit("player-left", {
          playerId,
          playerName: playerName || "Player",
          message: `${playerName || "Player"} left the game`
        })
        
        // Send updated game state for dots
        if (game.type === "dots") {
          socket.to(roomId).emit("game-state", game.engine.getState())
        }
      }
      
      // Leave the room
      socket.leave(roomId)
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
      
      // Find which rooms this socket was in and notify other players
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id)
      
      rooms.forEach(roomId => {
        const game = getGame(roomId)
        if (game) {
          // Find the disconnected player
          let disconnectedPlayerId = null
          let disconnectedPlayerName = null
          
          for (const [pid, player] of Object.entries(game.engine.state.players)) {
            // Check if this player's socket disconnected
            if (socket.data?.playerId === pid) {
              disconnectedPlayerId = pid
              disconnectedPlayerName = player.name || "Player"
              break
            }
          }
          
          // Notify remaining players and end game if needed
          if (disconnectedPlayerId && Object.keys(game.engine.state.players).length > 1) {
            // End the game if it's Join the Dots
            if (game.type === "dots" && !game.engine.state.gameOver) {
              game.engine.endGamePlayerLeft(disconnectedPlayerId)
            }
            
            socket.to(roomId).emit("player-left", {
              playerId: disconnectedPlayerId,
              playerName: disconnectedPlayerName,
              message: `${disconnectedPlayerName} left the game`
            })
            
            // Send updated game state for dots
            if (game.type === "dots") {
              io.to(roomId).emit("game-state", game.engine.getState())
            }
          }
        }
      })
    })
  })

}