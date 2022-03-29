import { Tone, Rest } from "../util/midi-handling.js"

const meterLikeTone = meter => lexem =>
  lexem instanceof Tone && Math.round(lexem.noteValue % meter) === 0

// Lexem => bool
export default {
  default: {
    tone: lexem => lexem instanceof Tone,
    rest: lexem => lexem instanceof Rest
  },

  peaks: {
    peak: lexem => lexem instanceof Tone && lexem.peak,
    fill: lexem => lexem instanceof Tone && !lexem.peak,
    rest: lexem => lexem instanceof Rest
  },

  'meter-like': {
    'rest': lexem => lexem instanceof Rest,
    '3': meterLikeTone(3),
    '2': meterLikeTone(2),
    '1': lexem => lexem instanceof Tone && lexem.noteValue === 1,
    '?': lexem => lexem instanceof Tone
  }
}
