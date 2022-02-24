export default {

  'even': o => typeof o === 'number' && o % 2 === 0 ,

  'odd': o => typeof o === 'number' && o % 2 !== 0 ,

  'text': o => typeof o === 'string'

}
