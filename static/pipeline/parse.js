const defaultGrammar = [
  ['S', 0, ['MORE']],

  ['MORE', 1, ['*', 'MORE']],
  ['MORE', -1, [null]],
]

const restSeparated = [
  ['S', 0, ['MORE']],

  ['MORE', 0, ['TONES', 'rest', 'MORE']],
  ['MORE', 0, ['TONES']],

  ['TONES', 0, ['tone', 'TONES']],
  ['TONES', -1, ['tone']]
]

const peaks = [
  ['S', 0, ['MORE']],
  ['MORE', 0, ['TOKEN', 'MORE']],
  ['MORE', 0, ['TOKEN']],
  ['TOKEN', 0, ['peak']],
  ['TOKEN', 0, ['fill']],
  ['TOKEN', 0, ['rest']]
]

const beatLike = [
  ['S', 0, ['MORE']],
  ['MORE', 0, ['TRIPLES', 'MORE']],
  ['MORE', 0, ['TRIPLES']],
  ['MORE', 0, ['DOUBLES', 'MORE']],
  ['MORE', 0, ['DOUBLES']],
  ['MORE', 0, ['SINGLES', 'MORE']],
  ['MORE', 0, ['SINGLES']],
  ['MORE', 0, ['HALVES', 'MORE']],
  ['MORE', 0, ['HALVES']],
  ['MORE', 0, ['THIRDS', 'MORE']],
  ['MORE', 0, ['THIRDS']],
  ['MORE', 0, ['RESTS', 'MORE']],
  ['MORE', 0, ['RESTS']],
  ['MORE', 0, ['UNKNOWN', 'MORE']],
  ['MORE', 0, ['UNKNOWN']],
  ['TRIPLES', 0, ['3', 'TRIPLES']],
  ['TRIPLES', 0, ['3']],
  ['DOUBLES', 0, ['2', 'DOUBLES']],
  ['DOUBLES', 0, ['2']],
  ['SINGLES', 0, ['1', 'SINGLES']],
  ['SINGLES', 0, ['1']],
  ['HALVES', 0, ['1/2', 'HALVES']],
  ['HALVES', 0, ['1/2']],
  ['THIRDS', 0, ['1/3', 'THIRDS']],
  ['THIRDS', 0, ['1/3']],
  ['RESTS', 0, ['r', 'RESTS']],
  ['RESTS', 0, ['r']],
  ['UNKNOWN', 0, ['?', 'UNKNOWN']],
  ['UNKNOWN', 0, ['?']]
]

const rhythm = [
  ['S', 0, ['MORE']],
  ['S', 0, ['ANY', 'MORE']], // upbeat
  ['MORE', 0, ['PAIR', 'MORE']],
  ['MORE', 0, ['ANY', 'MORE']], // account for dirtily short tokens
  ['MORE', 0, ['PAIR']],
  ['MORE', 0, ['ANY']], // single one left
  ['MORE', 0, [null]], // avoid termination in any-any instaed of pair(x)
  ['PAIR', 0, ['STRAIGHT']],
  ['PAIR', 0, ['SWING']],
  ['STRAIGHT', 0, ['1', '1']],
  ['STRAIGHT', 0, ['1/2', '1/2']],
  ['SWING', 0, ['1', '1/2']],
  ['ANY', 0, ['r']],
  ['ANY', 0, ['3']],
  ['ANY', 0, ['2']],
  ['ANY', 0, ['1']],
  ['ANY', 0, ['1/2']],
  ['ANY', 0, ['1/3']],
  ['ANY', 0, ['?']]
]

const anyTwo = [
  ['S', 0, ['LEFT', 'RIGHT']],
  
  ['LEFT', 5, ['*', 'LEFT']],
  ['LEFT', 1, [null]],

  ['RIGHT', 1, ['*', 'RIGHT']],
  ['RIGHT', -1, [null]]
]

const monotoneIntervallic = [
  ['S', 0, ['PHRASE']],

  ['PHRASE', 0, ['UNISO', 'PHRASE']],
  ['PHRASE', 0, ['SCALE', 'PHRASE']],
  ['PHRASE', 0, ['ARPEG', 'PHRASE']],
  ['PHRASE', 0, ['JUMPS', 'PHRASE']],
  ['PHRASE', -1, [null]],

  ['UNISO', 0, ['unison', 'UNISO']],
  ['UNISO', -1, ['unison']],

  ['SCALE', 0, ['SCALEU']],
  ['SCALEU', 0, ['scale-up', 'SCALEU']],
  ['SCALEU', -1, ['scale-up']],
  ['SCALE', 0, ['SCALED']],
  ['SCALED', 0, ['scale-down', 'SCALED']],
  ['SCALED', -1, ['scale-down']],

  ['ARPEG', 0, ['ARPEGU']],
  ['ARPEGU', 0, ['arpeg-up', 'ARPEGU']],
  ['ARPEGU', -1, ['arpeg-up']],
  ['ARPEG', 0, ['ARPEGD']],
  ['ARPEGD', 0, ['arpeg-down', 'ARPEGD']],
  ['ARPEGD', -1, ['arpeg-down']],

  ['JUMPS', 0, ['JUMPSU']],
  ['JUMPSU', 0, ['jump-up', 'JUMPSU']],
  ['JUMPSU', -1, ['jump-up']],
  ['JUMPS', 0, ['JUMPSD']],
  ['JUMPSD', 0, ['jump-down', 'JUMPSD']],
  ['JUMPSD', -1, ['jump-down']]
]

const randomIntervallic = [
  ['S', 0, ['PHRASE']],

  ['PHRASE', 2, ['UNISO', 'PHRASE']],
  ['PHRASE', 2, ['SCALE', 'PHRASE']],
  ['PHRASE', 2, ['ARPEG', 'PHRASE']],
  ['PHRASE', 2, ['JUMPS', 'PHRASE']],
  ['PHRASE', 1, ['RANDS', 'PHRASE']],
  ['PHRASE', -1, [null]],

  ['UNISO', 0, ['unison', 'UNISO']],
  ['UNISO', -1, ['unison']],

  ['SCALE', 0, ['scale-up', 'SCALE']],
  ['SCALE', 0, ['scale-down', 'SCALE']],
  ['SCALE', -1, ['scale-up']],
  ['SCALE', -1, ['scale-down']], 

  ['ARPEG', 0, ['arpeg-up', 'ARPEG']],
  ['ARPEG', 0, ['arpeg-down', 'ARPEG']],
  ['ARPEG', -1, ['arpeg-up']],
  ['ARPEG', -1, ['arpeg-down']],

  ['JUMPS', 0, ['jump-up', 'JUMPS']],
  ['JUMPS', 0, ['jump-down', 'JUMPS']],
  ['JUMPS', -1, ['jump-up']],
  ['JUMPS', -1, ['jump-down']],

  ['RANDS', 1, ['unison', 'RANDS']],
  ['RANDS', 1, ['unison']],
  ['RANDS', 1, ['scale-up', 'RANDS']],
  ['RANDS', 1, ['scale-up']],
  ['RANDS', 1, ['scale-down', 'RANDS']],
  ['RANDS', 1, ['scale-down']],
  ['RANDS', 1, ['arpeg-up', 'RANDS']],
  ['RANDS', 1, ['arpeg-up']],
  ['RANDS', 1, ['arpeg-down', 'RANDS']],
  ['RANDS', 1, ['arpeg-down']],
  ['RANDS', 1, ['jump-up', 'RANDS']],
  ['RANDS', 1, ['jump-up']],
  ['RANDS', 1, ['jump-down', 'RANDS']],
  ['RANDS', 1, ['jump-down']]
]

const intervallic = [
  ['S', 0, ['PHRASE']],

  ['PHRASE', 2, ['UNISO', 'PHRASE']],
  ['PHRASE', 2, ['SCALE', 'PHRASE']],
  ['PHRASE', 2, ['ARPEG', 'PHRASE']],
  ['PHRASE', 2, ['JUMPS', 'PHRASE']],
  ['PHRASE', -1, [null]],

  ['UNISO', 0, ['unison', 'UNISO']],
  ['UNISO', -1, ['unison']],

  ['SCALE', 0, ['scale-up', 'SCALE']],
  ['SCALE', 0, ['scale-down', 'SCALE']],
  ['SCALE', -1, ['scale-up']],
  ['SCALE', -1, ['scale-down']], 

  ['ARPEG', 0, ['arpeg-up', 'ARPEG']],
  ['ARPEG', 0, ['arpeg-down', 'ARPEG']],
  ['ARPEG', -1, ['arpeg-up']],
  ['ARPEG', -1, ['arpeg-down']],

  ['JUMPS', 0, ['jump-up', 'JUMPS']],
  ['JUMPS', 0, ['jump-down', 'JUMPS']],
  ['JUMPS', -1, ['jump-up']],
  ['JUMPS', -1, ['jump-down']]
]

export default {
  default: defaultGrammar,
  'rest-separated': restSeparated,
  'vol-peak-seq': peaks,
  'beat-like-seq': beatLike,
  'rhythmic-seq': rhythm,
  'any-two-motives': anyTwo,
  'monotone-intervallic': monotoneIntervallic,
  'random-intervallic': randomIntervallic,
  'intervallic': intervallic
}
