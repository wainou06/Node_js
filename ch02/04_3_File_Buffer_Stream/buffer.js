// Buffer 객체를 생성하고 다양한 함수 사용
// Buffer: 이진데이터를 저장하기 위한 메모리 공간

const buffer = Buffer.from('저를 버퍼로 바꿔보세요.')
console.log('from():', buffer) // buffer 객체
console.log('length:', buffer.length) // buffer 길이 출력
console.log('toStrting():', buffer.toString()) // buffer를 문자열로 변환

// buffer 객체를 여러개의 배열로 다루기
const array = [Buffer.from('띄엄 '), Buffer.from('띄엄 '), Buffer.from('띄어쓰기 ')]

// concat()을 사용해 여러개의 Buffer를 하나의 Buffer로 병합
const buffer2 = Buffer.concat(array)
console.log('concat():', buffer2.toString())

// 빈 Buffer 객체 생성
const buffer3 = Buffer.alloc(5) // 크기가 5인 빈 buffer 객체 생성
console.log('alloc()', buffer3)

// <Buffer 00 00 00 00 00> -> 00은 1바이트 크기의 이진 데이터를 16진수로 표현
// 16진수: 이진 데이터를 사람이 읽기 쉽게 하기 위해서 사용
// 이진데이터(2진수): 실제 컴퓨터가 데이터를 처리하는 방식