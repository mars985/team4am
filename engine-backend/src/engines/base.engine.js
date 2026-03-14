class BaseEngine{

  constructor(config){
    this.config = config
  }

  initializeGame(){
    throw new Error("initializeGame not implemented")
  }

  handleMove(){
    throw new Error("handleMove not implemented")
  }

  getState(){
    return this.state
  }

}

export default BaseEngine