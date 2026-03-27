import BaseEngine from "./base.engine.js"
import { isValidWord, getRandomLetters } from "../utils/dictionary.js"

class StrandsEngine extends BaseEngine{

  constructor(config){
    super(config)

    const letterData = getRandomLetters()

    this.state={
      board: letterData.allLetters,
      baseWord: letterData.baseWord,
      players:{},
      foundWords: new Set(),
      startTime: Date.now(),
      timeLimit: 180000, // 3 minutes in milliseconds
      gameEnded: false
    }
  }

  addPlayer(playerId, playerName){
    if(!this.state.players[playerId]){
      this.state.players[playerId]={
        name: playerName || "Guest",
        words:[],
        score:0
      }
    }
  }

  async submitWord(playerId, word, selectedIndices){
    // Check if game has ended
    const timeElapsed = Date.now() - this.state.startTime
    if (timeElapsed >= this.state.timeLimit) {
      this.state.gameEnded = true
      return { success: false, message: "Time's up!" }
    }

    const wordUpper = word.toUpperCase()
    
    // Check minimum length
    if(word.length < this.config.minWordLength) {
      return { success: false, message: "Word too short" }
    }

    // Check if word already found
    if(this.state.foundWords.has(wordUpper)){
      return { success: false, message: "Word already found" }
    }

    // Validate letters are from the board
    const selectedLetters = selectedIndices.map(i => this.state.board[i]).join("")
    if(selectedLetters !== wordUpper){
      return { success: false, message: "Invalid letter selection" }
    }

    // Validate word exists in dictionary (async API call)
    const isValid = await isValidWord(word)
    if(!isValid){
      return { success: false, message: "Not a valid word" }
    }

    // Calculate points
    const points = word.length * this.config.pointsPerLetter

    // Update player state
    this.state.players[playerId].words.push(wordUpper)
    this.state.players[playerId].score += points
    this.state.foundWords.add(wordUpper)

    return { 
      success: true, 
      message: "Valid word!", 
      points,
      word: wordUpper 
    }
  }

  getTimeRemaining() {
    const timeElapsed = Date.now() - this.state.startTime
    const remaining = Math.max(0, Math.floor((this.state.timeLimit - timeElapsed) / 1000))
    
    if (remaining === 0 && !this.state.gameEnded) {
      this.state.gameEnded = true
    }
    
    return remaining
  }

  resetBoard(){
    const letterData = getRandomLetters()
    this.state.board = letterData.allLetters
    this.state.baseWord = letterData.baseWord
    this.state.foundWords.clear()
    this.state.startTime = Date.now()
    this.state.gameEnded = false
    
    // Reset all players' scores and words
    Object.keys(this.state.players).forEach(playerId => {
      this.state.players[playerId].words = []
      this.state.players[playerId].score = 0
    })
  }

}

export default StrandsEngine