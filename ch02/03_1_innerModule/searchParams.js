const url = require('url')
const myURL = new URL('http://www.gilbut.co.kr/?page=3&limit=10&category=nodejs&category=javascript')

console.log(myURL.searchParams)
console.log(myURL.searchParams.getAll('category'))
console.log(myURL.searchParams.get('limit'))
console.log(myURL.searchParams.get('page'))
console.log(myURL.searchParams.has('page')) // 쿼리스트링 내부에 해당 파라메터가 있는지 확인

console.log('키와 값을 가져옴------------------------')
console.log(myURL.searchParams.keys())
console.log(myURL.searchParams.values())

console.log('키와 값을 추가, 제거----------------------------')
myURL.searchParams.append('filter', 'es3') // 키와 값 추가
console.log(myURL.searchParams.get('filter')) // 확인

myURL.searchParams.delete('filter') // 제거
console.log(myURL.searchParams.get('filter')) // 확인

// searchParams 객체를 다시 문자열로 만듦
console.log(myURL.searchParams.toString())
