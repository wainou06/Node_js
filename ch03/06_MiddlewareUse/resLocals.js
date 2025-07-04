const express = require('express')
require('dotenv').config()

const app = express()
app.set('port', process.env.PORT || 3000)

// 첫번째 미들웨어
app.use((req, res, next) => {
   res.locals.appName = 'MyExpressApp'
   res.locals.timestamp = new Date().toISOString() // 현재 시간 저장
   next() // 다음 미들웨어로 이동
})

// 두번째 미들웨어
app.use((req, res, next) => {
   console.log(`App Name: ${res.locals.appName}`)
   console.log(`App timestamp: ${res.locals.timestamp}`)
   next() //app.get(..)으로 이동
})

app.get('/', (req, res) => {
   res.send(`
        <h1>환영합니다! ${res.locals.appName}</h1>
        <p>Request received at: ${res.locals.timestamp}</p>
        `)
})

app.listen(app.get('port'), () => {
   console.log(`서버가 작동 중 입니다. http://localhost:${app.get('port')}`)
})
