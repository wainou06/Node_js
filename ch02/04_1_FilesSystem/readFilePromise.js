const fs = require('fs').promises

fs.readFile('./readme.txt')
   .then((data) => {
      console.log(data.toString()) // 파일 내용 출력
   })
   .catch((err) => {
      console.err(err) // 에러 발생시 에러 출력
   })
