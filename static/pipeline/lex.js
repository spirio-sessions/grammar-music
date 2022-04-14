import { Tone, Rest } from "../util/midi-handling.js"

const meterLikeTone = meter => lexem =>
  lexem instanceof Tone && lexem.noteValue > 1 && Math.round(lexem.noteValue % meter) === 0

const defaultLex = {
  tone: lexem => lexem instanceof Tone,
  rest: lexem => lexem instanceof Rest
}

const meterLike = {
  'r': lexem => lexem instanceof Rest,
  '3': meterLikeTone(3),
  '2': meterLikeTone(2),
  '1': lexem => lexem instanceof Tone && lexem.noteValue === 1,
  '1/2': lexem => lexem instanceof Tone && Math.abs(lexem.noteValue * 2 - 1) < 0.001,
  '1/3': lexem => lexem instanceof Tone && Math.abs(lexem.noteValue * 3 - 1) < 0.001,
  '?': lexem => lexem instanceof Tone
}

// Lexem => bool
export default {
  default: meterLike,

  peaks: {
    peak: lexem => lexem instanceof Tone && lexem.peak,
    fill: lexem => lexem instanceof Tone && !lexem.peak,
    rest: lexem => lexem instanceof Rest
  },

  'meter-like': meterLike
}
