const express = require('express')
const path = require('path')
require('dotenv').config()

const app = express()
app.set('port', process.env.PORT || 3000)

// 3. static 미들웨어 사용: 정적파일에 바로 접근가능하게 하는 미들웨어
// public 폴더에서 정적파일을 찾는다
console.log(__dirname)
console.log(path.join(__dirname, 'public'))

// app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/image', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
   res.send('홈페이지')
})

app.get('/about', (req, res) => {
   res.send('소개 페이지')
})

app.listen(app.get('port'), () => {
   console.log(`서버가 작동 중 입니다. http://localhost:${app.get('port')}`)
})
