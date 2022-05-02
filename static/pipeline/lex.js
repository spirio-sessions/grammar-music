import { Tone, Rest, Interval } from "../util/midi-handling.js"

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

const isInterval = i => lexem => 
  lexem instanceof Interval &&
  lexem.halfToneSteps % 12 === i

const intervals = {
  'i-11': isInterval(-11),
  'i-10': isInterval(-10),
  'i-9': isInterval(-9),
  'i-8': isInterval(-8),
  'i-7': isInterval(-7),
  'i-6': isInterval(-6),
  'i-5': isInterval(-5),
  'i-4': isInterval(-4),
  'i-3': isInterval(-3),
  'i-2': isInterval(-2),
  'i-1': isInterval(-1),
  'i0': isInterval(0),
  'i1': isInterval(1),
  'i2': isInterval(2),
  'i3': isInterval(3),
  'i4': isInterval(4),
  'i5': isInterval(5),
  'i6': isInterval(6),
  'i7': isInterval(7),
  'i8': isInterval(8),
  'i9': isInterval(9),
  'i10': isInterval(10),
  'i11': isInterval(11)
}

const eventsIntervals = {
  'tone': lexem => lexem instanceof Tone,
  'rest': lexem => lexem instanceof Rest,
  ...intervals
}

const isUnison = lexem =>
  isInterval(0)(lexem)

const isScaleUp = lexem =>
  lexem instanceof Interval &&
  (lexem.halfToneSteps === 1 || lexem.halfToneSteps === 2)

const isScaleDown = lexem =>
  lexem instanceof Interval &&
  (lexem.halfToneSteps === -1 || lexem.halfToneSteps === -2)

const isArpegUp = lexem =>
  lexem instanceof Interval &&
  lexem.halfToneSteps >= 3 &&
  lexem.halfToneSteps <= 7

const isArpegDown = lexem =>
  lexem instanceof Interval &&
  lexem.halfToneSteps <= -3 &&
  lexem.halfToneSteps >= -7

const isJumpUp = lexem =>
  lexem instanceof Interval &&
  lexem.halfToneSteps > 7

const isJumpDown = lexem =>
  lexem instanceof Interval &&
  lexem.halfToneSteps < -7

const intervallic = {
  'unison': isUnison, 
  'scale-up': isScaleUp,
  'scale-down': isScaleDown,
  'arpeg-up': isArpegUp,
  'arpeg-down': isArpegDown,
  'jump-up': isJumpUp,
  'jump-down': isJumpDown
}

// Lexem => bool
export default {
  default: defaultLex,
  
  'beat-like': beatLike,

  'events-intervals': eventsIntervals,

  intervals: intervals,

  intervallic: intervallic,

  peaks: {
    peak: lexem => lexem instanceof Tone && lexem.peak,
    fill: lexem => lexem instanceof Tone && !lexem.peak,
    rest: lexem => lexem instanceof Rest
  }
}
