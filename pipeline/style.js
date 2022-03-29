import { Tone } from '../util/midi-handling.js'

// colorizeToken :: Token => cssColor
// printLeaf :: STLeaf => string
export default {
  default: {
    colorizeToken: _ => 'black'
  },
  
  meter: {
    colorizeToken: token =>
      token.name === '3' ? 'red'
      : token.name === '2' ? 'blue'
      : token.name === '1' ? 'green'
      : token.name === '1/2' ? 'yellow'
      : token.name === '1/3' ? 'purple'
      : token.name === '1/4' ? 'pink'
      : 'grey',

    printLeaf: undefined
  }

}