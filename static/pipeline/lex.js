import { Tone, Rest } from "../util/midi-handling.js"

const beatLikeTone = meter => lexem =>
  lexem instanceof Tone && lexem.noteValue > 1 && Math.round(lexem.noteValue % meter) === 0

const defaultLex = {
  tone: lexem => lexem instanceof Tone,
  rest: lexem => lexem instanceof Rest
}

const beatLike = {
  'r': lexem => lexem instanceof Rest,
  '3': beatLikeTone(3),
  '2': beatLikeTone(2),
  '1': lexem => lexem instanceof Tone && lexem.noteValue === 1,
  '1/2': lexem => lexem instanceof Tone && Math.abs(lexem.noteValue * 2 - 1) < 0.001,
  '1/3': lexem => lexem instanceof Tone && Math.abs(lexem.noteValue * 3 - 1) < 0.001,
  '?': lexem => lexem instanceof Tone
}

// Lexem => bool
export default {
  default: defaultLex,

  peaks: {
    peak: lexem => lexem instanceof Tone && lexem.peak,
    fill: lexem => lexem instanceof Tone && !lexem.peak,
    rest: lexem => lexem instanceof Rest
  },

  'beat-like': beatLike
}
