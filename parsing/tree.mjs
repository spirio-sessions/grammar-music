import { Token } from "./lexer.mjs"
import { error, isEmpty } from "./util.mjs"

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
 * depth-first traversal of (Abstract)SyntaxTrees
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
 * breadth-first traversal of (Abstract)SyntaxTrees
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
