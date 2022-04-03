const defaultStyle = {
  colorizeToken: _ => 'black'
} 

const meter = {
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

// colorizeToken :: Token => cssColor
// printLeaf :: STLeaf => string
export default {
  default: meter,
  meter: meter
}
