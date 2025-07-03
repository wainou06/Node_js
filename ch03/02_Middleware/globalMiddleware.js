const express = require('express')
require('dotenv').config()

const app = express()
app.set('port', process.env.PORT || 3000)

// 1. 전역 미들웨어: 모든 request에서 동작하는 미들웨어
// ★ 'request - 미들웨어 - response' 중간에서 동작
app.use((req, res, next) => {
   console.log(`${req.method} ${req.url}`)
   console.log('미들웨어 1 실행')
   next() // response 해주는 콜백함수로 이동
})

app.use((req, res, next) => {
    console.log('미들웨어 2 실행')
    next()
})

app.get('/', (req, res) => {
   console.log('홈페이지')
   res.send('홈페이지')
})

app.get('/about', (req, res) => {
   console.log('소개 페이지')
   res.send('소개 페이지')
})

app.listen(app.get('port'), () => {
   console.log(`서버가 작동 중입니다. http://localhost:${app.get('port')}`)
})
