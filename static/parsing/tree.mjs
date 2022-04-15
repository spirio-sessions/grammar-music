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
