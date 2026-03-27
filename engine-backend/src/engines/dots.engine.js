import BaseEngine from "./base.engine.js"

class DotsEngine extends BaseEngine{

  constructor(config){
    super(config)

    this.state = {
      edges:[],
      boxes:{},
      scores:{1:0,2:0},
      currentPlayer:1,
      players:{},
      gridSize: config.gridSize,
      gameOver: false,
      winner: null
    }
  }

  addPlayer(playerId, playerNumber, playerName){
    if(!this.state.players[playerId]){
      this.state.players[playerId] = {
        playerNumber,
        color: playerNumber === 1 ? "blue" : "red",
        name: playerName || `Player ${playerNumber}`
      }
    }
  }

  edgeExists(key){
    return this.state.edges.some(e=>e.key===key)
  }

  handleMove(playerId, edge){
    // Check if it's this player's turn
    const player = this.state.players[playerId]
    if(!player || player.playerNumber !== this.state.currentPlayer){
      return { success: false, message: "Not your turn" }
    }

    // Check if edge already exists
    if(this.edgeExists(edge.key)){
      return { success: false, message: "Edge already exists" }
    }

    // Add the edge
    this.state.edges.push({
      ...edge,
      player: this.state.currentPlayer
    })

    // Check if any boxes were completed
    const scored = this.checkBoxes()

    // Switch player if no box was scored
    if(!scored){
      this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1
    }

    // Check if game is over
    this.checkGameOver()

    return { success: true, scored }
  }

  checkBoxes(){
    let scored = false
    const size = this.state.gridSize

    for(let r = 0; r < size; r++){
      for(let c = 0; c < size; c++){
        const top = this.edgeExists(`${r},${c}-h`)
        const bottom = this.edgeExists(`${r+1},${c}-h`)
        const left = this.edgeExists(`${r},${c}-v`)
        const right = this.edgeExists(`${r},${c+1}-v`)

        const key = `${r},${c}`

        if(top && bottom && left && right && !this.state.boxes[key]){
          this.state.boxes[key] = this.state.currentPlayer
          this.state.scores[this.state.currentPlayer]++
          scored = true
        }
      }
    }
    return scored
  }

  checkGameOver(){
    const totalBoxes = this.state.gridSize * this.state.gridSize
    const completedBoxes = Object.keys(this.state.boxes).length

    if(completedBoxes === totalBoxes){
      this.state.gameOver = true
      
      if(this.state.scores[1] > this.state.scores[2]){
        this.state.winner = 1
      } else if(this.state.scores[2] > this.state.scores[1]){
        this.state.winner = 2
      } else {
        this.state.winner = "tie"
      }
    }
  }

  resetGame(){
    this.state.edges = []
    this.state.boxes = {}
    this.state.scores = {1:0, 2:0}
    this.state.currentPlayer = 1
    this.state.gameOver = false
    this.state.winner = null
  }

  endGamePlayerLeft(leavingPlayerId){
    // Find the leaving player's number
    const leavingPlayer = this.state.players[leavingPlayerId]
    if (!leavingPlayer) return
    
    const leavingPlayerNumber = leavingPlayer.playerNumber
    const remainingPlayerNumber = leavingPlayerNumber === 1 ? 2 : 1
    
    // End the game with the remaining player as winner
    this.state.gameOver = true
    this.state.winner = remainingPlayerNumber
  }

}

export default DotsEngine