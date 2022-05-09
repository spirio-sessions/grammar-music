import { Token } from "./lexer.mjs"
import { error } from "../util/util.js"

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
      st.children
        .map(c => c.transformAST(c))
        .filter(c => c)))
        
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
    transformAST ??= (st => st instanceof STEmpty
      ? null
      : new ASTLeaf(st.label, st.token.lexem))

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

  isTerminalNode() {
    return this.children.every(c => c instanceof ASTLeaf)
  }
}

export class ASTLeaf extends AbstractSyntaxTree {
  constructor(label, value) {
    super(label, value)
  }
}

/**
 * necessary when tree is parsed from JSON and type information is lost
 * @param {*} tree 
 * @returns {boolean}
 */
export function isLeaf(tree) {
  return (
    ('label' in tree && 'token' in tree && 'transformAST' in tree)
    ||
    ('label' in tree && 'value' in tree && !('children' in tree)))
  // children comparison necessary since ASTNode has label and value, too
}

/**
 * necessary when tree is parsed from JSON and type information is lost
 * @param {*} tree 
 * @returns {boolean}
 */
export function isNode(tree) {
  return (
    ('label' in tree && 'children' in tree && 'transformAST' in tree)
    ||
    ('label' in tree && 'children' in tree && 'value' in tree))
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
 * @param {(st:SyntaxTree)=>any} calculateValue
 */
export function contractR(node, calculateValue = () => null) {
  if (!node instanceof STNode)
    error(`node must be instance of STNode`)
  if (node.children.length < 2)
    error(`node must exactly have at least two children, instead got ${node.children.length}`)

  const leftChildren = node.children.slice(0, -1)
  const rightMostChild = node.children.at(-1)

  if (!rightMostChild instanceof STNode)
    error('rightmost child must be STNode')
  if (!rightMostChild.label === node.label)
    error(`rightmost child must have same label, instead got ${rightMostChild.label}`)
  
  let astChildren = leftChildren.map(c => c.transformAST(c))
  const astContract = rightMostChild.transformAST(rightMostChild)
  if (astContract instanceof ASTNode) {
    if (astContract.label === node.label)
      astChildren.push(...astContract.children)
    else
      astChildren.push(astContract)
  }
  else
    astChildren.push(astContract)
  astChildren = astChildren.filter(c => c) // filter out empty leafs

  const astValue = calculateValue(node)

  return new ASTNode(node.label, astValue, astChildren)
}

/**
 * depth-first traversal of (Abstract)SyntaxTrees,
 * no return value, side-effect only,
 * no type information is needed -> can be used with JSON
 * @param {SyntaxTree|AbstractSyntaxTree} tree 
 * @param {(SyntaxTree|AbstractSyntaxTree) => void} cb 
 */
export function dft(tree, cb) {
  if (isLeaf(tree))
    cb(tree)
  else if (isNode(tree)) {
    for (const c of tree.children)
      dft(c, cb)
    cb(tree)
  }
  else
    error('input is not a(n) (Abstract)SyntaxTree')
}

/**
 * breadth-first traversal of (Abstract)SyntaxTrees,
 * no return value, side-effect only,
 * no type information is needed -> can be used with JSON
 * @param {SyntaxTree|AbstractSyntaxTree} tree 
 * @param {(SyntaxTree|AbstractSyntaxTree) => void} cb 
 */
export function bft(tree, cb) {
  const queue = [tree]

  iter()

  function iter() {
    if (queue.isEmpty())
      return

    const tree = queue.shift()

    if (isLeaf(tree)) {
      cb(tree)
      iter()
    }
    else if (isNode(tree)) {
      cb(tree)
      for (const c of tree.children)
        queue.push(c)
      iter()
    }
    else
      error('input is not a(n) (Abstract)SyntaxTree')  
  }
}

/**
 * @param {SyntaxTree|AbstractSyntaxTree} tree 
 * @returns {SyntaxTree|AbstractSyntaxTree}
 */
export function copyTree(tree) {
  if (tree instanceof STLeaf) {
    const lexemCopy = copyObjectWithPrototype(tree.token.lexem)
    const tokenCopy = new Token(tree.token.name, lexemCopy)
    return new STLeaf(tree.label, tokenCopy, tree.transformAST)
  }
  else if (tree instanceof ASTLeaf) {
    const valueCopy = copyObjectWithPrototype(tree.value)
    return new ASTLeaf(tree.label, valueCopy)
  }
  else if (tree instanceof STNode) {
    const childrenCopy = tree.children.map(copyTree)
    return new STNode(tree.label, childrenCopy, tree.transformAST)
  }
  else if (tree instanceof ASTNode) {
    const childrenCopy = tree.children.map(copyTree)
    const valueCopy = copyObjectWithPrototype(tree.value)
    return new ASTNode(tree.label, valueCopy, childrenCopy)
  }
  else
    error('tree is not an (Abstract)SyntaxTree')

  function copyObjectWithPrototype(obj) {
    if (!(obj instanceof Object))
      return obj

    const copy = {}
    
    for (const [key, val] of Object.entries(obj))
      copy[key] = copyObjectWithPrototype(val)

    return Object.setPrototypeOf(copy, Object.getPrototypeOf(obj))
  }
}
