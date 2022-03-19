import { Tone } from '../util/midi-handling.js'

export default {
  
  default: {
    colorizeLexem: _ => 'black'
  },
  
  meter: {
    colorizeToken: token =>
      token.name === '3' ? 'red'
      : token.name === '2' ? 'blue'
      : token.name === '1' ? 'green'
      : 'grey',

    printLeaf: undefined
  }

}