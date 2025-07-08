const express = require('express')
const User = require('../models/user')
const router = express.Router()

// 모든 사용자
router.get('/', async (req, res, next) => {
   try {
      // select * from users
      const users = await User.findAll()
      console.log('user:', users)

      // 200: 성공
      // json 형태로 response
      res.status(200).json(users)
   } catch (error) {
      console.error(error)
      next(error) // 에러처리 미들웨어로 이동
   }
})

// 특정 사용자
// localhost:8000/users/:id
router.get('/:id', async (req, res, next) => {
   try {
      // select * from users where id = :id
      const user = await User.findAll({
         where: { id: req.params.id },
      })
      console.log(user)
      res.status(200).json(user)
   } catch (error) {
      console.error(error)
      next(error)
   }
})

module.exports = router
