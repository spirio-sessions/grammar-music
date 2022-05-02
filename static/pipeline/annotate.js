import { estimateBpm, annotateNoteValues} from '../util/analyse.js'
import { Interval, Rest, Tone } from '../util/midi-handling.js'
import { error, id } from '../util/util.js'

const filterShortRests = lexems => 
  lexems.filter(l => !(l instanceof Rest && l.noteValue < 1))

function noteValues(lexems) {
  const annotatedLexems = annotateNoteValues(lexems, estimateBpm(lexems))
  return  filterShortRests(annotatedLexems)
}

function peaks(lexems) {
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

function eventsIntervals(lexems) {
  if (lexems.length < 2)
    error('lexems must at least have length 2')

  let left = lexems[0], right
  const newLexems = [left]
  
  for (let i = 1; i < lexems.length; i++) {
    right = lexems[i]

    if (left instanceof Tone && right instanceof Tone) {
      const interval = new Interval(right.noteNumber - left.noteNumber)
      newLexems.push(interval)
    }

    left = right
    newLexems.push(right)
  }

  return newLexems
}

function intervals(lexems) {
  if (lexems.length < 2)
    error('lexems must at least have length 2')

  let left = lexems[0], right
  const intervals = []
  
  for (let i = 1; i < lexems.length; i++) {
    right = lexems[i]

    if (left instanceof Tone && right instanceof Tone) {
      const interval = new Interval(right.noteNumber - left.noteNumber, left, right)
      intervals.push(interval)
    }

    left = right
  }

  return intervals
}

// [Lexem] => [Lexem]
export default {
  default: id,

  'note-value': noteValues,

  'events-intervals': eventsIntervals,

  intervals: intervals,

  'peak-velocity': peaks
}
