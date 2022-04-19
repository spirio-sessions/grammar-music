//#region global configuration
const pipeline = {
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

const configs = {
  'midi-in':  midiIOMapToObject(midiAccess.inputs),
  annotate:   (await import('./pipeline/annotate.js')).default,
  lex:        (await import('./pipeline/lex.js')).default,
  parse:      (await import('./pipeline/parse.js')).default,
  transform:  (await import('./pipeline/transform.js')).default,
  style:      (await import('./pipeline/style.js')).default,
  'midi-out': midiIOMapToObject(midiAccess.outputs)
}
//#endregion



//#region setup main routine
import { mkMidiHandler, Lexem } from './util/midi-handling.js'
let lexems, lexemCursor = 0

import { renderLexems, renderTree } from './util/render.js'
const treeInDisplayId = 'tree-in-display'
const treeInASTDisplayId = 'tree-in-ast-display'
const treeOutDisplayId = 'tree-out-display'

import { transfer } from './util/midi-handling.js'

let protocol = {
  config: {},
  comment: '',
  recording: []
}

function onMidiMessageHandeled(result) {
  if (result instanceof Lexem) {
    lexems.push(result)
  }
}

function setOnMidiMessage(startTime, callback) {
  // if callback is falsy, undefined will be set as handler and midi handling thus stopped
  const handler = mkMidiHandler(startTime, callback)
  pipeline['midi-in'].onmidimessage = handler
}

/**
 * @param {[Lexem]} call 
 * @param {[Lexem]} response 
 */
function fillProtocol(call, response, st, ast, transformedAst) {
  Array.from(document.getElementsByTagName('select'))
    .forEach(e => {
      protocol.config[e.id] = e.value
    })
  
  if (!Array.isArray(protocol.recording))
    protocol.recording = []
  protocol.recording.push(call, response)

  protocol.st = st
  protocol.ast = ast
  protocol.transformAST = transformedAst
}

async function run() {
  setOnMidiMessage(0, undefined)

  const newLexems = lexems.slice(lexemCursor)
  lexemCursor = lexems.length

  const annotatedLexems = pipeline.annotate(newLexems)

  const tokens = pipeline.lex(annotatedLexems)
  const tokenizedLexems = tokens.map(t => t.lexem)
  renderLexems(tokenizedLexems, 'in', pipeline.style.colorizeToken)

  const { st } = pipeline.parse(tokens)
  await renderTree(treeInDisplayId, st, pipeline.style.printLeaf)
  const ast = st.transformAST(st)
  await renderTree(treeInASTDisplayId, ast, pipeline.style.printLeaf)
  // important, copy ast as transformations will modify it
  const transformedAst = pipeline.transform.tree(copyTree(ast)) 
  await renderTree(treeOutDisplayId, transformedAst, pipeline.style.printLeaf)
  show(0)

  const transformedLexems = pipeline.transform.serialize(transformedAst)
  renderLexems(transformedLexems, 'out', pipeline.style.colorizeToken)

  await transfer(transformedLexems, pipeline['midi-out'])

  fillProtocol(newLexems, transformedLexems, st, ast, transformedAst)

  setOnMidiMessage(performance.now(), onMidiMessageHandeled)
}

const runButton = document.getElementById('run')
runButton.onclick = run
//#endregion



//#region setup pipeline configuration ui
function restartIfReady() {
  if (!pipelineIsReady())
    return

  lexems = []
  lexemCursor = 0
  setOnMidiMessage(performance.now(), onMidiMessageHandeled)
}

import { Grammar } from './parsing/grammar.mjs'
import { Lexer } from './parsing/lexer.mjs'
import { Parser } from './parsing/parser.mjs'
import { copyTree } from './parsing/tree.mjs'
import { error } from './util/util.js'
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
      try {
        const grammar = Grammar.from(lexer.terminals(), configuration)
        const parser = new Parser(grammar)
        pipeline.parse = tokens => parser.run(...tokens)
      }
      catch (error) {
        alert('Lexer and parser do not match!')
      }
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

for (const [id, config] of Object.entries(configs)) {
  const options = Object.keys(config)
  wireSelectElement(id, options)
}
//#endregion



//#region setup tree rendering
const displays = [
  [treeInDisplayId, 'ST IN'],
  [treeInASTDisplayId, 'AST IN'],
  [treeOutDisplayId, 'AST OUT']
]
let displayIndex = 1

const toggleTreeDisplay = document.getElementById('toggle-tree')

function display(i, t) {
  const displayElement = document.getElementById(displays[i][0])
  if (t) {
    displayElement.style.display = 'block'
    toggleTreeDisplay.innerText = displays[i][1]
  }
  else
    displayElement.style.display = 'none'
}

function show(i) {
  display(0, false)
  display(1, false)
  display(2, false)
  display(i, true)
}

display(0, true)

toggleTreeDisplay.onclick = _ => {
  show(displayIndex)
  displayIndex = (displayIndex+1) % 3
}
//#endregion



//#region protocol saving
const commentTextArea = document.getElementById('comment-input')
commentTextArea.oninput = _ => protocol.comment = commentTextArea.value

/**
 * @returns {Promise<string>}
 */
async function getNewId() {
  return fetch('/id')
    .then(res => res.json())
    .then(idObj => idObj.id)
}

/**
 * @param {string} id 
 */
function downloadProtocol(id) {
  if (typeof id !== 'string')
    error('id must be a string')

  const protocolJson = JSON.stringify(protocol, null, 4)
  const a = document.createElement('a')

  a.setAttribute('href','data:application/json;charset=utf-8, ' + encodeURIComponent(protocolJson))
  a.setAttribute('download', id + '.json')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * @param {string} id 
 * @returns {Promise<void>}
 */
async function uploadProtocol(id) {
  if (typeof id !== 'string')
    error('id must be a string')
  
  return fetch(`/protocol?id=${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(protocol)
  })
  .catch(console.error)
}

const saveProtocolButton = document.getElementById('save-protocol')

saveProtocolButton.onclick = async () => {
  const id = await getNewId()
  downloadProtocol(id)
  await uploadProtocol(id)
}
//#endregion



restartIfReady()
