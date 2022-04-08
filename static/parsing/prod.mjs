import { ASTNode, ASTLeaf } from "./tree.mjs"

export default [

  ['S', NaN, ['B', 'A', 'B'], transfromBAB],
  
  ['B', NaN, ['b', 'B'], transformbB],
  ['B', NaN, [null], transformBe],

  ['A', NaN, ['a', 'A'], transformaA],
  ['A', NaN, [null], transformAe]

]

function transfromBAB(st) {
  const leftChildren = st.children[0].transformAST(st.children[0])
  const middleChildren = st.children[1].transformAST(st.children[1])
  const rightChildren = st.children[2].transformAST(st.children[2])
  return new ASTNode('BAB', 'nothing here to see', [
    new ASTNode('B', leftChildren.length, leftChildren),
    new ASTNode('A', middleChildren.length, middleChildren),
    new ASTNode('B', rightChildren.length, rightChildren)
  ])
}

function transformbB(st) {
  const ASTChildren = [new ASTLeaf('b')]
  const otherASTChildren = st.children[1].transformAST(st.children[1])
  if (otherASTChildren)
    ASTChildren.push(...otherASTChildren)
  return ASTChildren
}

function transformBe() {
  return false;
}

function transformaA(st) {
  const ASTChildren = [new ASTLeaf('a')]
  const otherASTChildren = st.children[1].transformAST(st.children[1])
  if (otherASTChildren)
    ASTChildren.push(...otherASTChildren)
  return ASTChildren
}

function transformAe() {
  return false;
}
