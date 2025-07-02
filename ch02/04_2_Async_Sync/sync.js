// 동기 방식으로 파일 읽기 -> 파일 크기에 상관없이 순차적으로 파일을 읽어온다

const fs = require('fs')

console.log('시작')

let data = fs.readFileSync('./readme2.txt')
console.log('1번', data.toString())

data = fs.readFileSync('./readme2.txt')
console.log('2번', data.toString())

data = fs.readFileSync('./readme2.txt')
console.log('3번', data.toString())

console.log('끝')
