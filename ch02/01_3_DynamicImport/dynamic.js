const a = true

// dynamic import: 특정 조건일 때 require
// commonJS 모듈일때 문제 없이 사용가능

if (a) {
   require('./func')
}

console.log('성공')
