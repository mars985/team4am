import { createEngine } from "../engines/engine.factory.js"
import { gamesConfig } from "../config/games.config.js"

const games = {}

export function createGame(roomId, type, customGridSize){

  const config = { ...gamesConfig[type] }
  
  // Allow custom grid size for dots game
  if (type === "dots" && customGridSize) {
    config.gridSize = parseInt(customGridSize) || config.gridSize
  }

  const engine = createEngine(type, config)

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