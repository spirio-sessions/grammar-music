const defaultGrammar = [
  ['S', 0, ['MORE']],
  ['MORE', 0, ['TOKEN', 'MORE']],
  ['MORE', 0, ['TOKEN']],
  ['TOKEN', 0, ['tone']],
  ['TOKEN', 0, ['rest']]
]

const peaks = [
  ['S', 0, ['MORE']],
  ['MORE', 0, ['TOKEN', 'MORE']],
  ['MORE', 0, ['TOKEN']],
  ['TOKEN', 0, ['peak']],
  ['TOKEN', 0, ['fill']],
  ['TOKEN', 0, ['rest']]
]

const meter = [
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

const twoThemes = [
  ['S',  0, ['T2', 'T2']],
  ['T2', 0, ['2']],
  ['T2', 0, ['1', '1']],
  ['T2', 0, ['1', '1/2', '1/2']],
  ['T2', 0, ['1/2', '1', '1/2']],
  ['T2', 0, ['1/2', '1/2', '1']],
  ['T2', 0, ['1/2', '1/2', '1/2', '1/2']]
]

// TODO: assemble 2 any nodes under S of random length
const anyTwo = [
  ['S', 0, ['LEFT', 'RIGHT']],
  
  ['LEFT', 1, ['ANY', 'LEFT']],
  ['LEFT', 1, ['ANY']],

  ['RIGHT', 1, ['ANY', 'RIGHT']],
  ['RIGHT', -1, [null]],

  ['ANY', 0, ['3']],
  ['ANY', 0, ['2']],
  ['ANY', 0, ['1']],
  ['ANY', 0, ['1/2']],
  ['ANY', 0, ['1/3']],
  ['ANY', 0, ['r']],
  ['ANY', 0, ['?']]
]

export default {
  default: meter,
  peaks: peaks,
  meter: meter,
  rhythm: rhythm,
  'two-themes': twoThemes,
  'any-two': anyTwo
}
