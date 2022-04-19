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

export default {
  default: defaultGrammar,
  'rest-separated': restSeparated,
  'vol-peak-seq': peaks,
  'beat-like-seq': beatLike,
  'rhythmic-seq': rhythm,
  'any-two-motives': anyTwo
}
