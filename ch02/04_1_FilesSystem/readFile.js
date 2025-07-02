const fs = require('fs')

// readFile(읽을 파일 경로, 콜백함수)
fs.readFile('./readme.txt', (err, data) => {
   // data: 파일내용
   // err: 파일을 읽는 도중 에러 발생시 에러메세지

   if (err) {
      throw err
   }

   console.log(data)
   console.log(data.toString())
})
