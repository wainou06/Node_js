const express = require('express')
const bcrypt = require('bcrypt') // 암호화
const User = require('../models/user')
const router = express.Router()

// 회원가입
router.post('/join', async (req, res, next) => {
   try {
      const { email, nick, password } = req.body

      // 이메일로 기존 사용자 검색
      // select * from users where email = ? LIMIT 1;
      const exUser = await User.findOne({
         where: { email },
      })

      // 이미 사용자가 존재할 경우 409 상태코드와 메세지를 json 객체로 전달
      if (exUser) {
         return res.status(409).json({
            success: false,
            message: '이미 존재하는 사용자입니다.',
         })
      }

      // 이메일 중복 확인을 통과시 새로운 사용자 계정 생성

      // 비밀번호 암호화
      const hash = await bcrypt.hash(password, 12) // 12: salt(해시 암호화를 진행시 추가되는 임의의 데이터 주로 10~12 정도의 값이 권장됨)

      // 새로운 사용자 생성
      const newUser = await User.create({
         email,
         nick,
         password: hash,
      })

      // 성공 응답 반환
      res.status(201).json({
         success: true,
         message: '사용자가 성공적으로 등록되었습니다.',
         // insert한 데이터 일부 전달
         user: {
            id: newUser.id,
            email: newUser.email,
            nick: newUser.nick,
         },
      })
   } catch (error) {
      error.message = '회원가입 중 오류가 발생했습니다.'
      next(error)
   }
})

module.exports = router
