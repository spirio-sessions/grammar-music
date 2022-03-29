export default {
  default: [
    [ 'S' , NaN , [ 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'TOKEN' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'TOKEN']] ,
    [ 'TOKEN' , NaN , [ 'tone' ]] ,
    [ 'TOKEN' , NaN , [ 'rest' ]]
  ],

  peaks: [
    [ 'S' , NaN , [ 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'TOKEN' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'TOKEN']] ,
    [ 'TOKEN' , NaN , [ 'peak' ]] ,
    [ 'TOKEN' , NaN , [ 'fill' ]] ,
    [ 'TOKEN' , NaN , [ 'rest' ]]
  ],

  meter: [
    [ 'S' , NaN , [ 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'TRIPLES' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'TRIPLES']] ,
    [ 'MORE' , NaN , [ 'DOUBLES' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'DOUBLES']] ,
    [ 'MORE' , NaN , [ 'SINGLES' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'SINGLES']] ,
    [ 'MORE' , NaN , [ 'HALVES' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'HALVES']] ,
    [ 'MORE' , NaN , [ 'THIRDS' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'THIRDS']] ,
    [ 'MORE' , NaN , [ 'QUARTERS' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'QUARTERS']] ,
    [ 'MORE' , NaN , [ 'RESTS' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'RESTS']] ,
    [ 'MORE' , NaN , [ 'UNKNOWN' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'UNKNOWN']] ,
    [ 'TRIPLES' , NaN , [ '3' , 'TRIPLES' ]] ,
    [ 'TRIPLES' , NaN , [ '3' ]] ,
    [ 'DOUBLES' , NaN , [ '2' , 'DOUBLES' ]] ,
    [ 'DOUBLES' , NaN , [ '2' ]] ,
    [ 'SINGLES' , NaN , [ '1' , 'SINGLES' ]] ,
    [ 'SINGLES' , NaN , [ '1' ]] ,
    [ 'HALVES' , NaN , [ '1/2' , 'HALVES' ]] ,
    [ 'HALVES' , NaN , [ '1/2' ]] ,
    [ 'THIRDS' , NaN , [ '1/3' , 'THIRDS' ]] ,
    [ 'THIRDS' , NaN , [ '1/3' ]] ,
    [ 'QUARTERS' , NaN , [ '1/4' , 'QUARTERS' ]] ,
    [ 'QUARTERS' , NaN , [ '1/4' ]] ,
    [ 'RESTS' , NaN , [ 'r' , 'RESTS' ]] ,
    [ 'RESTS' , NaN , [ 'r' ]] ,
    [ 'UNKNOWN' , NaN , [ '?' , 'UNKNOWN' ]] ,
    [ 'UNKNOWN' , NaN , [ '?' ]]
  ],

  rhythm: [
    [ 'S' , NaN , [ 'MORE' ]] ,
    [ 'S' , NaN , [ 'ANY' , 'MORE' ]] , // upbeat
    [ 'MORE' , NaN , [ 'PAIR' , 'MORE' ]] ,
    [ 'MORE' , NaN , [ 'ANY' , 'MORE' ]] , // account for dirtily short tokens
    [ 'MORE' , NaN , [ 'PAIR' ]] ,
    [ 'MORE' , NaN , [ 'ANY' ]] , // single one left
    [ 'MORE' , NaN , [ null ]] , // avoid termination in any-any instaed of pair(x)
    [ 'PAIR' , NaN , [ 'STRAIGHT' ]] ,
    [ 'PAIR' , NaN , [ 'SWING' ]] ,
    [ 'STRAIGHT' , NaN , [ '1' , '1' ]] ,
    [ 'SWING' , NaN , [ '2' , '1' ]] ,
    [ 'ANY' , NaN , [ 'r' ]] ,
    [ 'ANY' , NaN , [ '3' ]] ,
    [ 'ANY' , NaN , [ '2' ]] ,
    [ 'ANY' , NaN , [ '1' ]] ,
    [ 'ANY' , NaN , [ '?' ]]
  ]
}
