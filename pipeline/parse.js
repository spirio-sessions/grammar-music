import { bubbleGrand, bubbleOne, contractR } from '../parsing/parser.mjs'

const defaultGrammar = [
  ['S', NaN, ['MORE']],
  ['MORE', NaN, ['TOKEN', 'MORE']],
  ['MORE', NaN, ['TOKEN']],
  ['TOKEN', NaN, ['tone']],
  ['TOKEN', NaN, ['rest']]
]

const peaks = [
  ['S', NaN, ['MORE']],
  ['MORE', NaN, ['TOKEN', 'MORE']],
  ['MORE', NaN, ['TOKEN']],
  ['TOKEN', NaN, ['peak']],
  ['TOKEN', NaN, ['fill']],
  ['TOKEN', NaN, ['rest']]
]

const meter = [
  ['S', NaN, ['MORE'], bubbleGrand],
  ['MORE', NaN, ['TRIPLES', 'MORE'], contractR],
  ['MORE', NaN, ['TRIPLES'], bubbleOne],
  ['MORE', NaN, ['DOUBLES', 'MORE'], contractR],
  ['MORE', NaN, ['DOUBLES'], bubbleOne],
  ['MORE', NaN, ['SINGLES', 'MORE'], contractR],
  ['MORE', NaN, ['SINGLES'], bubbleOne],
  ['MORE', NaN, ['HALVES', 'MORE'], contractR],
  ['MORE', NaN, ['HALVES'], bubbleOne],
  ['MORE', NaN, ['THIRDS', 'MORE'], contractR],
  ['MORE', NaN, ['THIRDS'], bubbleOne],
  ['MORE', NaN, ['QUARTERS', 'MORE'], contractR],
  ['MORE', NaN, ['QUARTERS'], bubbleOne],
  ['MORE', NaN, ['RESTS', 'MORE'], contractR],
  ['MORE', NaN, ['RESTS'], bubbleOne],
  ['MORE', NaN, ['UNKNOWN', 'MORE'], contractR],
  ['MORE', NaN, ['UNKNOWN'], bubbleOne],
  ['TRIPLES', NaN, ['3', 'TRIPLES'], contractR],
  ['TRIPLES', NaN, ['3'], bubbleOne],
  ['DOUBLES', NaN, ['2', 'DOUBLES'], contractR],
  ['DOUBLES', NaN, ['2'], bubbleOne],
  ['SINGLES', NaN, ['1', 'SINGLES'], contractR],
  ['SINGLES', NaN, ['1'], bubbleOne],
  ['HALVES', NaN, ['1/2', 'HALVES'], contractR],
  ['HALVES', NaN, ['1/2'], bubbleOne],
  ['THIRDS', NaN, ['1/3', 'THIRDS'], contractR],
  ['THIRDS', NaN, ['1/3'], bubbleOne],
  ['QUARTERS', NaN, ['1/4', 'QUARTERS'], contractR],
  ['QUARTERS', NaN, ['1/4'], bubbleOne],
  ['RESTS', NaN, ['r', 'RESTS'], contractR],
  ['RESTS', NaN, ['r'], bubbleOne],
  ['UNKNOWN', NaN, ['?', 'UNKNOWN'], contractR],
  ['UNKNOWN', NaN, ['?'], bubbleOne]
]

const rhythm = [
  ['S', NaN, ['MORE']],
  ['S', NaN, ['ANY', 'MORE']], // upbeat
  ['MORE', NaN, ['PAIR', 'MORE']],
  ['MORE', NaN, ['ANY', 'MORE']], // account for dirtily short tokens
  ['MORE', NaN, ['PAIR']],
  ['MORE', NaN, ['ANY']], // single one left
  ['MORE', NaN, [null]], // avoid termination in any-any instaed of pair(x)
  ['PAIR', NaN, ['STRAIGHT']],
  ['PAIR', NaN, ['SWING']],
  ['STRAIGHT', NaN, ['1', '1']],
  ['STRAIGHT', NaN, ['1/2', '1/2']],
  ['SWING', NaN, ['1', '1/2']],
  ['ANY', NaN, ['r']],
  ['ANY', NaN, ['3']],
  ['ANY', NaN, ['2']],
  ['ANY', NaN, ['1']],
  ['ANY', NaN, ['1/2']],
  ['ANY', NaN, ['1/3']],
  ['ANY', NaN, ['1/4']],
  ['ANY', NaN, ['?']]
]

export default {
  default: meter,
  peaks: peaks,
  meter: meter,
  rhythm: rhythm
}
