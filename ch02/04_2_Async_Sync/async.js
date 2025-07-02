// 비동기 방식으로 파일 읽기 -> 순서대로 파일을 읽어오지 X
// 파일을 여러개 읽을 때 몇개의 파일이 크기가 크다면 비동기 방식으로 읽어오는게 유리

const fs = require('fs')

console.log('시작')

fs.readFile('./readme2.txt', (err, data) => {
   if (err) {
      throw err
   }
   console.log('1번', data.toString())
})

fs.readFile('./readme2.txt', (err, data) => {
   if (err) {
      throw err
   }
   console.log('2번', data.toString())
})

fs.readFile('./readme2.txt', (err, data) => {
   if (err) {
      throw err
   }
   console.log('3번', data.toString())
})

console.log('끝')
