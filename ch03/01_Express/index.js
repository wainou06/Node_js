const express = require('express')
require('dotenv').config() // env파일을 사용하기 위한 라이브러리 로드

const app = express()
app.set('port', process.env.PORT || 3000) // 포트번호 지정

// http://localhost:8000/ 로 get request(데이터를 줘)가 온 경우 실행
app.get('/', (req, res) => {
   // request가 들어오면 콜백함수 부분의 코드를 실행
   console.log('req:', req) // 요청에 대한 정보가 들어있음
   console.log('res:', res) // 응답을 처리하는 객체
   console.log('수정')
   res.send('안녕! node express!')
})

// http://localhost:8000/ 로 post request(데이터를 생성해줘)가 온 경우 실행
// app.post('/', (req, res) => {
//    res.send('안녕! node express!')
// })

// http://localhost:8000/test 로 request가 온 경우 실행
app.get('/test', (req, res) => {
   res.send('안녕! test!')
})

app.listen(app.get('port'), () => {
   console.log(`서버가 작동 중입니다. http://localhost:${app.get('port')}`)
})
