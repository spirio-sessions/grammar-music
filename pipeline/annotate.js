import { estimateBpm, annotateNoteValues} from '../util/analyse.js'
import { Rest } from '../util/midi-handling.js'

export default {
  default: lexems => lexems ,

  'note-value': lexems => {
    const annotatedLexems = annotateNoteValues(lexems, estimateBpm(lexems))
    return  filterShortRests(annotatedLexems)
  },

  peaks: lexems => {
    if (lexems.length < 3)
      return lexems.map(t => {
        t.peak = false
        return t
      })

    if (lexems[0].velocity > lexems[1].velocity)
      lexems[0].peak = true
    
    for (let i = 1; i < lexems.length - 1; i++) {
      if (lexems[i-1].velocity < lexems[i].velocity && lexems[i].velocity > lexems[i+1].velocity)
        lexems[i].peak = true
      else
        lexems[i].peak = false
    }

    if (lexems.at(-1).velocity > lexems.at(-2).velocity)
      lexems.at(-1).peak = true

    return lexems
  }
}

const filterShortRests = lexems => 
  lexems.filter(l => !(l instanceof Rest && l.noteValue < 1))
