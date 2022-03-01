import { Tone, Rest } from '../tokenize.js'

export default {

  anchor: t => t instanceof Tone && t.dominant,

  filler: t => t instanceof Tone && !t.dominant,

  rest: t => t instanceof Rest

}
