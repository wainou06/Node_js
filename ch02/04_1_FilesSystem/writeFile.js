const fs = require('fs')

// writeFile(작성할 파일 경로, 작성할 글자, 콜백함수)
fs.writeFile('./writeme.txt', '글이 입력됩니다.', (err) => {
   if (err) {
      // 파일 쓰는 과정에서 문제 발생시 err 메세지 throw
      throw err
   }
   console.log('파일 쓰기 완료!')

   // 파일 작성 후 읽어오기
   fs.readFile('./writeme.txt', (err, data) => {
      console.log(data.toString())
   })
})
