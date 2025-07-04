const express = require('express')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
app.set('port', process.env.PORT || 3000)
app.use(morgan('dev'))

// 라우팅
const indexRouter = require('./routes')
const userRouter = require('./routes/user')

app.use('/', indexRouter)
app.use('/user', userRouter)

app.listen(app.get('port'), () => {
   console.log(`서버가 작동 중 입니다. http://localhost:${app.get('port')}`)
})
