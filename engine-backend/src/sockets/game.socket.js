import { createGame,getGame,gameExists } from "../services/gameState.service.js"
import { updateLeaderboard } from "../services/leaderboard.service.js"

export default function registerGameSocket(io){

  io.on("connection",socket=>{

    socket.on("join-game",({roomId,type,playerId})=>{

      socket.join(roomId)

      if(!gameExists(roomId)){
        createGame(roomId,type)
      }

      const game = getGame(roomId)

      if(type==="strands"){
        game.engine.addPlayer(playerId)
      }

      io.to(roomId).emit("game-state",game.engine.getState())

    })

    socket.on("player-move",({roomId,data})=>{

  const game = getGame(roomId)

  if(!game) return

  if(game.type==="dots"){
    game.engine.handleMove(data)
  }

  if(game.type==="strands"){

    game.engine.submitWord(data.playerId,data.word)

    const player = game.engine.state.players[data.playerId]

    updateLeaderboard(
      game.type,
      data.playerId,
      player.score
    )

  }

  io.to(roomId).emit("game-state",game.engine.getState())

})

  })

}