const cookieParser = require('cookie-parser')
const express = require('express')
const morgan = require('morgan')
const path = require('path')
require('dotenv').config()

const app = express()
app.set('port', process.env.PORT || 3000)

app.use(morgan('dev'), express.static(path.join(__dirname, 'public')), express.json(), express.urlencoded({ extended: false }), cookieParser('my-secret-key'))

app.listen(app.get('port'), () => {
   console.log(`서버가 작동 중 입니다. http://localhost:${app.get('port')}`)
})
