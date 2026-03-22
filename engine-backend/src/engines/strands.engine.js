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
      foundWords: new Set()
    }
  }

  addPlayer(playerId){
    if(!this.state.players[playerId]){
      this.state.players[playerId]={
        words:[],
        score:0
      }
    }
  }

  async submitWord(playerId, word, selectedIndices){
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

  resetBoard(){
    const letterData = getRandomLetters()
    this.state.board = letterData.allLetters
    this.state.baseWord = letterData.baseWord
    this.state.foundWords.clear()
  }

}

export default StrandsEngine