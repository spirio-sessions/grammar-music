import { SyntaxTree, STLeaf, STNode, dft, STEmpty } from '../parsing/parser.mjs'

// SyntaxTree => [Token]
export default {
  default: flatten,

  reverse: st => flatten(st).reverse(),

  'straight-to-swing': st => flatten(straight2swing(st)),

  'swing-to-straight': st => flatten(swing2straight(st)),
}

function flatten(syntaxTree) {
    const output = []
    dft(syntaxTree, st => {
      if (st instanceof STLeaf && !(st instanceof STEmpty))
        output.push(st.token)
    })
    return output
}

const bpmToPeriodMs = bpm => 60000 / bpm

function straight2swing(syntaxTree) {
  dft(syntaxTree, st => {
    if (st instanceof STNode && st.label === 'STRAIGHT') {
      st.label = 'SWING'

      const tokenL = st.children[0].token
      const tokenR = st.children[1].token
      const beatPeriosMs = (bpmToPeriodMs(tokenL.lexem.bpm) * 2) / 3
      
      tokenL.lexem.noteValue = 2
      tokenL.lexem.duration = beatPeriosMs * 2
      tokenL.name = '2'

      tokenR.lexem.noteValue = 1
      tokenR.lexem.duration = beatPeriosMs
      tokenR.name = '1'
    }
  })

  return syntaxTree
}

function swing2straight(syntaxTree) {
  dft(syntaxTree, st => {
    if (st instanceof STNode && st.label === 'SWING') {
      st.label = 'STRAIGHT'

      const tokenL = st.children[0].token
      const tokenR = st.children[1].token
      const beatPeriosMs = bpmToPeriodMs(tokenL.lexem.bpm) * 1.5

      tokenL.lexem.noteValue = 1
      tokenL.lexem.duration = bpmToPeriodMs(tokenL.lexem.bpm)
      tokenL.name = '1'

      tokenR.lexem.noteValue = 1
      tokenR.lexem.duration = bpmToPeriodMs(tokenR.lexem.bpm)
      tokenR.name = '1'
    }
  })

  return syntaxTree
}
