// const timeout = setTimeout(() => {
//    console.log('1.5초 후 실행')
// }, 1500)

// const interval = setTimeout(() => {
//    console.log('1초 마다 실행')
// }, 1000)

// setTimeout(() => {
//    clearTimeout(timeout) // 7초 뒤 setTimeout 중지
//    clearInterval(interval) // 7초 뒤 setInterval 중지
// }, 7000)

setTimeout(() => {
   console.log('setTimeout')
}, 0)

// setTimeout(함수, 0)보다 setImmediate이 먼저 실행되기는 하지만 항상 그렇지는 않으므로 두개를 같이 사용하길 권장 X
const immediate = setImmediate(() => {
   console.log('즉시 실행')
})

const immediate2 = setImmediate(() => {
   console.log('실행되지 않습니다.')
})

clearImmediate(immediate2)
