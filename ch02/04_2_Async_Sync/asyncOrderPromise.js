const fs = require('fs').promises

console.log('시작')

// then을 사용하므로 순서대로 파일을 읽어옴
fs.readFile('./readme2.txt')
   .then((data) => {
      console.log('1번', data.toString())
      return fs.readFile('./readme2.txt')
   })
   .then((data) => {
      console.log('2번', data.toString())
      return fs.readFile('./readme2.txt')
   })
   .then((data) => {
      console.log('3번', data.toString())
      console.log('끝')
   })
   .catch((err) => {
      console.error(err)
   })
