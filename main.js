window.pipeline = {
  'midi-in': undefined,
  annotate: undefined,
  lex: undefined,
  parse: undefined,
  transform: undefined,
  style: undefined,
  'midi-out': undefined
}

/**
 * @returns {Boolean}
 */
function pipelineIsReady() {
  return Object
    .values(pipeline)
    .reduce((acc, step) => acc &&= step, true)
}

const midiAccess = await navigator.requestMIDIAccess()

/**
 * converts midi input/output map into string indexed object
 * @param {MIDIInputMap|MIDIOutputMap} midiMap 
 * @returns {{String:MIDIInput|MIDIOutput}}
 */
function midiIOMapToObject(midiMap) {
  const midiObj = {}
  midiMap.forEach(io => {
    midiObj[io.name] = io
  })
  return midiObj
}

window.configs = {
  'midi-in':  midiIOMapToObject(midiAccess.inputs),
  annotate:   (await import('./pipeline/annotate.js')).default,
  lex:        (await import('./pipeline/lex.js')).default,
  parse:      (await import('./pipeline/parse.js')).default,
  transform:  (await import('./pipeline/transform.js')).default,
  style:      (await import('./pipeline/style.js')).default,
  'midi-out': midiIOMapToObject(midiAccess.outputs)
}

import { mkMidiHandler, Tone, Rest } from './util/midi-handling.js'
let lexems, lexemCursor = 0, playing, lastToneFinishedAt
import { renderTokens, renderTree } from './util/render.js'
import { transfer } from './util/midi-handling.js'
const pollingInterval = 50 //ms
let timerId

function onMidiMessageHandeled(result) {
  if (!result)
    playing = true
  else if (result instanceof Rest) {
    playing = true
    lexems.push(result)
  }
  else if (result instanceof Tone) {
    playing = false
    lastToneFinishedAt = performance.now()
    lexems.push(result)
  }
}

function setOnMidiMessage(startTime, callback) {
  const handler = mkMidiHandler(startTime, callback)
  pipeline['midi-in'].onmidimessage = handler
}

function restartIfReady() {
  if (!pipelineIsReady())
    return

  // recognize lexems from midi events
  lexems = []
  lexemCursor = 0
  playing = true
  lastToneFinishedAt = undefined
  setOnMidiMessage(performance.now(), onMidiMessageHandeled)

  clearInterval(timerId)

  function isSilence(ms) {
    return !playing && performance.now() - lastToneFinishedAt >= ms
  }

  timerId = setInterval(async () => {
    if (!isSilence(2000))
      return
    
    playing = true
    setOnMidiMessage(0, undefined)

    const newLexems = lexems.slice(lexemCursor)
    lexemCursor = lexems.length

    const annotatedLexems = pipeline.annotate(newLexems)

    const tokens = pipeline.lex(annotatedLexems)
    console.log(tokens.map(t => t.name + " : " + t.lexem.noteValue))
    renderTokens(tokens, 'in', pipeline.style.colorizeToken)

    const parserResult = pipeline.parse(tokens)
    await renderTree(parserResult.st, pipeline.style.printLeaf)

    const transformedTokens = pipeline.transform(parserResult.st)
    renderTokens(transformedTokens, 'out', pipeline.style.colorizeToken)

    const transformedLexems = transformedTokens.map(token => token.lexem)
    await transfer(transformedLexems, pipeline['midi-out'])

    setOnMidiMessage(performance.now(), onMidiMessageHandeled)
  }, pollingInterval)
}

import { Grammar } from './parsing/grammar.mjs'
import { Lexer } from './parsing/lexer.mjs'
import { Parser } from './parsing/parser.mjs'
let lexer
/**
 * sets options of select element and initializes corresponding pipeline state
 * @param {String} id 
 * @param {Array<String>} options
 */
function wireSelectElement(id, options) {
  const selectElement = document.getElementById(id)
  const optionElements = options.map(optionString => {
    const optionElement = document.createElement('option')
    optionElement.value = optionString
    optionElement.innerText = optionString
    return optionElement
  })

  selectElement.append(...optionElements)

  const setPipelineStep = () => {
    const id = selectElement.id
    const name = selectElement.value
    const configuration = configs[id][name]

    if (id === 'lex') {
      lexer = new Lexer(configuration)
      pipeline.lex = lexems => lexer.run(...lexems)
    }
    else if (id === 'parse') {
      const grammar = Grammar.from(lexer.terminals(), configuration)
      const parser = new Parser(grammar)
      pipeline.parse = tokens => parser.run(...tokens)
    }
    else
      pipeline[id] = configs[id][name]
  }

  // initially set pipeline step
  setPipelineStep()

  selectElement.onchange = () => {
    setPipelineStep()
    restartIfReady()
  }
}

// initialize configuration ui and pipeline state
for (const [id, config] of Object.entries(configs)) {
  const options = Object.keys(config)
  wireSelectElement(id, options)
}
// start processing imidiately if all configs filled with valid defaults
restartIfReady()
