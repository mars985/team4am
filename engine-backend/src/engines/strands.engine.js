import BaseEngine from "./base.engine.js"

class StrandsEngine extends BaseEngine{

  constructor(config){
    super(config)

    const letters = [
      ...config.baseWord.split(""),
      ...config.extraLetters
    ]

    this.state={
      board:this.shuffle(letters),
      players:{}
    }
  }

  shuffle(arr){
    return arr.sort(()=>Math.random()-0.5)
  }

  addPlayer(playerId){

    if(!this.state.players[playerId]){
      this.state.players[playerId]={
        words:[],
        score:0
      }
    }

  }

  submitWord(playerId,word){

    if(word.length < this.config.minWordLength) return

    const points = word.length * this.config.pointsPerLetter

    this.state.players[playerId].words.push(word)
    this.state.players[playerId].score += points

  }

}

export default StrandsEngine