const express = require('express')
const router = express.Router() // 라우터(경로 지정)를 가져온다

router.get(
   '/',
   (req, res, next) => {
      next('route')
   },
   (req, res, next) => {
      console.log('실행되지 않습니다.')
      next()
   },
   (req, res, next) => {
      console.log('실행되지 않습니다.')
      next()
   }
)

router.get('/', (req, res) => {
   res.send('Hello, Express')
})

router.get('/test', (req, res) => {
   res.send('Hello, Express test')
})

router.get('/:id', (req, res) => {
   res.send('GET /' + req.params.id)
})

router.get('/:id/test', (req, res) => {
   res.send('GET /' + req.params.i + '/test')
})

module.exports = router // 라우터를 내보냄
