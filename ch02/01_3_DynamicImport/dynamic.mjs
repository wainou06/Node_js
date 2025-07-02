const a = true

// dynamic import: 특정 조건일 때 require
// commonJS 모듈일때 문제 없이 사용가능

// if (a) {
//    import ('./func.mjs')
// }

// console.log('성공')

// ES모듈 await 키워드 사용
if (a) {
   await import('./func.mjs')
}

console.log('성공')