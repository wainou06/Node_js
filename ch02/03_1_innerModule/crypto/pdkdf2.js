// 단방향 암호화: 복호화 할 수 X
const crypto = require('crypto')

// 64바이트의 랜덤한 바이트 데이터를 생성함
crypto.randomBytes(64, (err, buf) => {
   // buf: 랜덤한 바이트 데이터
   console.log(buf)

   // buf를 base64로 인코딩 -> 이게 salt 값
   const salt = buf.toString('base64')
   console.log('salt:', salt)

   // salt와 sha512 알고리즘을 이용해 100000번 반복해서 암호화
   crypto.pbkdf2('password111', salt, 100000, 64, 'sha512', (err, key) => {
      console.log(key.toString('base64')) // 암호화한 결과를 base64로 인코딩해 출력
   })
})
