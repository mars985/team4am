import BaseEngine from "./base.engine.js"

class DotsEngine extends BaseEngine{

  constructor(config){
    super(config)

    this.state = {
      edges:[],
      boxes:{},
      scores:{1:0,2:0},
      currentPlayer:1
    }
  }

  edgeExists(key){
    return this.state.edges.some(e=>e.key===key)
  }

  handleMove(edge){

    if(this.edgeExists(edge.key)) return

    this.state.edges.push(edge)

    if(!this.checkBoxes()){
      this.state.currentPlayer =
      this.state.currentPlayer === 1 ? 2 : 1
    }

  }

  checkBoxes(){

    let scored=false

    const size = this.config.gridSize

    for(let r=0;r<size;r++){
      for(let c=0;c<size;c++){

        const top = this.edgeExists(`${r},${c}-h`)
        const bottom = this.edgeExists(`${r+1},${c}-h`)
        const left = this.edgeExists(`${r},${c}-v`)
        const right = this.edgeExists(`${r},${c+1}-v`)

        const key = `${r},${c}`

        if(top && bottom && left && right && !this.state.boxes[key]){

          this.state.boxes[key] = this.state.currentPlayer
          this.state.scores[this.state.currentPlayer]++
          scored=true

        }
      }
    }
    return scored
  }

}

export default DotsEngine