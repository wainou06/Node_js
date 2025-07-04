const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
app.set('port', process.env.PORT || 3000)

app.use(morgan('dev')) // 로그 미들웨어
app.use('/', express.static(path.join(__dirname, 'public'))) // 정적파일 접근 미들웨어
app.use(express.json())
app.use(express.urlencoded({ extended: false })) // 클라이언트에서 주는 데이터를 json 객체로 받기 위해 사용하는 미들웨어

// 업로드 폴더 확인 및 생성
try {
   fs.readdirSync('uploads')
} catch (error) {
   console.log('uploads 폴더가 없으므로 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') // 폴더 생성
}

const upload = multer({
   storage: multer.diskStorage({
      // 업로드 파일 저장 경로 설정
      destination(req, file, done) {
         done(null, 'uploads/') // uploads 폴더에 저장
      },

      // 저장할 파일 이름 설정
      filename(rep, file, done) {
         const ext = path.extname(file.originalname) // 파일 확장자 추출
         done(null, path.basename(file.originalname, ext) + Date.now() + ext) // 어떤 파일명으로 저장할지 지정
      },
   }),
   limits: { fieldNameSize: 5 * 1024 * 1024 }, // 업로드 파일 크기 제한(5MB)
})

// http://localhost:8000/upload
app.get('/upload', (req, res) => {
   res.sendFile(path.join(__dirname, 'multipart.html'))
})

// name='image'인 파일 하나만 업로드
app.post('/upload', upload.single('image'), (req, res) => {
   console.log(req.file) //업로드된 파일 정보 출력
   res.send('파일 업로드 완료')
})

app.listen(app.get('port'), () => {
   console.log(`서버가 작동 중 입니다. http://localhost:${app.get('port')}`)
})
