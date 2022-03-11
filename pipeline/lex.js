import { Tone, Rest } from "../util/midi-handling.js"

export default {
  default: {
    tone: lexem => lexem instanceof Tone,
    rest: lexem => lexem instanceof Rest
  },

  peaks: {
    peak: lexem => lexem instanceof Tone && lexem.peak,
    fill: lexem => lexem instanceof Tone && !lexem.peak,
    rest: lexem => lexem instanceof Rest
  }
}