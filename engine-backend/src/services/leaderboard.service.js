const leaderboard = {}

export function updateLeaderboard(gameType, playerId, score){

  if(!leaderboard[gameType]){
    leaderboard[gameType] = {}
  }

  if(!leaderboard[gameType][playerId]){
    leaderboard[gameType][playerId] = 0
  }

  leaderboard[gameType][playerId] += score
}

export function getLeaderboard(gameType){

  if(!leaderboard[gameType]) return []

  const players = Object.entries(leaderboard[gameType])

  players.sort((a,b)=> b[1] - a[1])

  return players.map(p=>({
    playerId:p[0],
    score:p[1]
  }))
}