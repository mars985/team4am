import { createEngine } from "../engines/engine.factory.js"
import { gamesConfig } from "../config/games.config.js"

const games = {}

export function createGame(roomId,type){

  const config = gamesConfig[type]

  const engine = createEngine(type,config)

  games[roomId] = {
    type,
    engine
  }

}

export function getGame(roomId){
  return games[roomId]
}

export function gameExists(roomId){
  return !!games[roomId]
}