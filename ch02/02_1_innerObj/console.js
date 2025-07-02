const string = 'abc'
const number = 1
const boolean = true
const obj = {
   outside: {
      inside: {
         key: 'value',
      },
   },
}

console.table([
   { name: '제로', birht: 1994 },
   { name: 'hero', birht: 1988 },
])

// 객체를 콘솔에 어떻게 표시할지를 설정
console.dir(obj, { colors: true, depth: 1 })
console.dir(obj, { colors: false, depth: 2 })
console.dir(obj)

// 코드의 실행시간 측정
console.time('실행 시간측정') // time과 timeEnd 함수의 글자가 같아야 한다
for (let i = 0; i < 100000; i++) {}
console.timeEnd('실행 시간측정')

// 에러위치 추적
function b() {
   console.trace('에러 위치 추적') // 에러가 어디서 발생했는지 추적하게 해줌
}

function a() {
   b()
}

a()
