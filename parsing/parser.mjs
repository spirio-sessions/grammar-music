import { error, isEmpty } from './util.mjs'
import { Token } from './lexer.mjs'
import { Grammar } from './grammar.mjs'

export class SyntaxTree {
  /**
   * @param {String} label 
   * @param {(st:SyntaxTree)=>AbstractSyntaxTree?} transformAST
   */
  constructor(label, transformAST) {
    this.label = label
    this.transformAST = transformAST
  }
}

export class STNode extends SyntaxTree {
  /**
   * @param {String} label 
   * @param  {[SyntaxTree]} children
   * @param {(st:STNode)=>ASTNode?} transformAST
   */
  constructor(label, children, transformAST) {
    transformAST ??= (st => new ASTNode(
      st.label, 
      null, 
      st.children.flatMap(c => c.transformAST(c))))
    super(label, transformAST)
    this.children = children
  }
}

export class STLeaf extends SyntaxTree {
  /**
   * @param {String} label 
   * @param {Token} token
   * @param {(st:STLeaf)=>ASTLeaf?} transformAST
   */
  constructor(label, token, transformAST) {
    transformAST ??= (st => new ASTLeaf(st.label, st.token.lexem))
    super(label, transformAST)
    this.token = token
  }
}

export class STEmpty extends STLeaf{
  /**
   * @param {(st:STLeaf)=>ASTLeaf?} transformAST 
   */
  constructor(transformAST) {
    transformAST ??= (_ => null) 
    super('empty', new Token('e', '⌀'), transformAST)
  }
}

export class AbstractSyntaxTree {
  constructor(label, value) {
    this.label = label
    this.value = value
  }
}

export class ASTNode extends AbstractSyntaxTree {
  constructor(label, value, children) {
    super(label, value)
    this.children = children
  }
}

export class ASTLeaf extends AbstractSyntaxTree {
  constructor(label, value) {
    super(label, value)
  }
}

/**
 * @param {STNode} node 
 * @returns {AbstractSyntaxTree?}
 */
export function bubbleOne(node) {
  if (!node.children.length === 1)
    error(`node must exactly have one child, instead got ${node.children.length}`)

  const onlyChild = node.children[0]
  return onlyChild.transformAST(onlyChild)
}

/**
 * @param {STNode} node 
 * @returns {AbstractSyntaxTree}
 */
export function bubbleGrand(node) {
  if (!node.children.length === 1)
    error(`node must exactly have one child, instead got ${node.children.length}`)
  
  const onlyChild = node.children[0]
  const onlyChildAST = onlyChild.transformAST(onlyChild)
  
  if (!onlyChildAST || onlyChildAST instanceof ASTLeaf)
    return new ASTLeaf(node.label, null)
  else
    return new ASTNode(node.label, null, onlyChildAST.children.filter(c => c)) // filter out empty leafs
}

/**
 * @param {STNode} node 
 * @param {(st:SyntaxTree)=>any} calculateValue
 */
export function contractR(node, calculateValue = () => null) {
  if (!node.children.length === 2)
    error(`node must exactly have two children, instead got ${node.children.length}`)

  const leftChild = node.children[0]
  const rightChild = node.children[1]
  if (!rightChild instanceof STNode)
    error('right child must be STNode')
  
  const leftAST = leftChild.transformAST(leftChild)
  const rightAST = rightChild.transformAST(rightChild)
  
  if (!(leftAST || rightAST))
    return false // both were empty

  const newChildren = []

  if (leftAST instanceof AbstractSyntaxTree)
    newChildren.push(leftAST)
  else
    error('invalid leftAST')

  if (!rightAST);
    // empty, do nothing
  else if (rightAST instanceof ASTLeaf)
    newChildren.push(rightAST)
  else if (rightAST instanceof ASTNode) {
    if (rightAST.label === node.label)
      newChildren.push(...rightAST.children.filter(c => c)) // filter empty
    else
      newChildren.push(rightAST)
  }
  else
    error('invalid rightAST')

  return new ASTNode(node.label, calculateValue(node), newChildren)
}

/**
 * @param {STNode} node 
 * @param {(st:SyntaxTree)=>any} calculateValue
 */
export function contractLR(node, calculateValue = () => null) {
  if (!node.children.length === 2)
    error(`node must exactly have two children, instead got ${node.children.length}`)

  const leftChild = node.children[0]
  const rightChild = node.children[1]
  
  const leftAST = leftChild.transformAST(leftChild)
  const rightAST = rightChild.transformAST(rightChild)
  
  if (!(leftAST || rightAST))
    return false // both were empty

  const newChildren = []

  if (!leftAST);
    // empty, do nothing
  else if (leftAST instanceof ASTLeaf)
    newChildren.push(leftAST)
  else if (leftAST instanceof ASTNode) {
    if (leftAST.label === node.label)
      newChildren.push(...leftAST.children.filter(c => c)) // filter empty
    else
      newChildren.push(leftAST)
  }
  else
    error('invalid leftAST')

  if (!rightAST);
    // empty, do nothing
  else if (rightAST instanceof ASTLeaf)
    newChildren.push(rightAST)
  else if (rightAST instanceof ASTNode) {
    if (rightAST.label === node.label)
      newChildren.push(...rightAST.children.filter(c => c)) // filter empty
    else
      newChildren.push(rightAST)
  }
  else
    error('invalid rightAST')

  return new ASTNode(node.label, calculateValue(node), newChildren)
}

/**
 * depth-first traversal of SyntaxTrees
 * no return value, side-effect only
 * @param {SyntaxTree|AbstractSyntaxTree} st 
 * @param {(SyntaxTree|AbstractSyntaxTree) => void} cb 
 */
export function dft(st, cb) {
  if (st instanceof STLeaf || st instanceof ASTLeaf)
    cb(st)
  else if (st instanceof STNode || st instanceof ASTNode) {
    cb(st)
    for (const c of st.children)
      dft(c, cb)
  }
  else
    error('input is not a(n) (Abstract)SyntaxTree')
}

/**
 * breadth-first traversal of SyntaxTrees
 * no return value, side-effect only
 * @param {SyntaxTree|AbstractSyntaxTree} st 
 * @param {(SyntaxTree|AbstractSyntaxTree) => void} cb 
 */
export function bft(st, cb) {
  const queue = [st]

  iter()

  function iter() {
    if (isEmpty(queue))
      return

    const st = queue.shift()

    if (st instanceof STLeaf || st instanceof ASTLeaf) {
      cb(st)
      iter()
    }
    else if (st instanceof STNode || st instanceof ASTNode) {
      cb(st)
      for (const c of st.children)
        queue.push(c)
      iter()
    }
    else
      error('input is not a(n) (Abstract)SyntaxTree')  
  }
}

/**
 * convenient wrapper function for passing a successful parser result
 * @param {SyntaxTree} st 
 * @param {Integer} index 
 * @returns {{success:true,st:SyntaxTree,index:Integer}}
 */
function succeed(st, index) {
  return {
    success: true,
    st: st,
    index: index
  }
}

/**
 * convenient wrapper function for passing a successful parser result
 * @param {String} symbol 
 * @param {Integer} index 
 * @returns {{success:true,st:SyntaxTree,index:Integer}}
 */
function fail(symbol, index, reason='') {
  return {
    success: false,
    symbol: symbol,
    index: index,
    reason: reason
  }
}

export class Parser {

  /**
   * @param {Grammar} grammar 
   */
  constructor(grammar) {
    this.grammar = grammar
    this.tokens = null
  }

  /**
   * @param {String} symbol 
   * @returns {Boolean}
   */
  isTerminal(symbol) {
    return this.grammar.terminals.has(symbol)
  }

  /**
   * @param {String} symbol 
   * @returns {Boolean}
   */
  isNonTerminal(symbol) {
    return this.grammar.nonTerminals.has(symbol)
  }

  /**
   * @param {String} symbol 
   * @returns {Boolean}
   */
  isEmptySymbol(symbol) {
    return symbol === null
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{success:boolean,index:number,}}
   */
  parse(symbol, index) {
    if (this.isTerminal(symbol))
      return this.parseT(symbol, index)

    if (this.isNonTerminal(symbol))
      return this.parseNT(symbol, index)

    if (this.isEmptySymbol(symbol))
      return succeed(new STEmpty(), index)

    return fail(symbol, index, 'invalid symbol')
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{SyntaxTree,Integer}}
   */
  parseT(symbol, index) {
    if (index >= this.tokens.length)
      return fail(symbol, index, 'index out of bounds')

    const token = this.tokens[index]

    if (token.name === symbol)
      return succeed(new STLeaf(symbol, token), index+1)
    else
      return fail(symbol, index, 'terminal does not match')
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{SyntaxTree,Integer}}
   */
  parseNT(symbol, index) {
    let res
    const production = this.grammar.productions[symbol]

    for (const body of production) {
      if (body.rhs.length > 1) {
        res = this.parseSeq(body.rhs, index)
        if (res.success)
          return succeed(new STNode(symbol, res.st, body.t), res.index)
      }
      else {
        res = this.parse(body.rhs[0], index)
        if (res.success)
          return succeed(new STNode(symbol, [res.st], body.t), res.index)
      }
    }

    return fail(symbol, index, 'all productions exhausted')
  }

  /**
   * @param {Array<String>} rhs 
   * @param {Integer} index 
   * @returns {{SyntaxTree,Integer}}
   */
  parseSeq(rhs, index) {
    const children = []
    let i = index, res

    for (const symbol of rhs) {
      res = this.parse(symbol, i)
      
      if (!res.success)
        return fail(symbol, i, `mismatch in right hand side sequence [${rhs.join(',')}]`)
      else {
        children.push(res.st)
        i = res.index
      }
    }

    return succeed(children, i)
  }

  /**
   * @param {...Token} tokens
   * @returns {{st:SyntaxTree,index:Integer}} 
   */
  run(...tokens) {
    if (isEmpty(tokens))
      throw new Error('empty parser input')

    this.tokens = tokens
    const result = this.parse('S', 0)
    
    if (!result.success)
      throw new Error(`parsing failed at position ${result.index} for symbol '${result.symbol}': ${result.reason}`)
    else
      return result
  }
}
