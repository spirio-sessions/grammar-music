import { Tone, Rest } from '../tokenize.js'

export default {

  tone: t => t instanceof Tone,

  rest: t => t instanceof Rest

}
