import DotsEngine from "./dots.engine.js"
import StrandsEngine from "./strands.engine.js"

export function createEngine(type,config){

  switch(type){

    case "dots":
      return new DotsEngine(config)

    case "strands":
      return new StrandsEngine(config)

    default:
      throw new Error("Unknown game type")

  }

}