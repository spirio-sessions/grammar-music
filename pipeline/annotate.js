export default {
  default: lexems => lexems ,

  //noteValue: lexems => lexems ,

  peaks: lexems => {
    if (lexems.length < 3)
      return lexems.map(t => {
        t.peak = false
        return t
      })

    if (lexems[0].velocity > lexems[1].velocity)
      lexems[0].peak = true
    
    for (let i = 1; i < lexems.length - 1; i++) {
      if (lexems[i-1].velocity < lexems[i].velocity && lexems[i].velocity > lexems[i+1].velocity)
        lexems[i].peak = true
      else
        lexems[i].peak = false
    }

    if (lexems.at(-1).velocity > lexems.at(-2).velocity)
      lexems.at(-1).peak = true

    return lexems
  }
}
