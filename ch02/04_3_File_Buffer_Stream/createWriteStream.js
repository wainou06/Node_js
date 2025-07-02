const fs = require('fs')

const writeStream = fs.createWriteStream('./writeme2.txt')

// 글쓰기
writeStream.write('이 글을 씁니다.\n')
writeStream.write('한 번 더 씁니다.')

// finish 이벤트: 쓰기 스트림이 종료되었을 때 발생
writeStream.on('finish', () => {
   console.log('파일 쓰기 완료')
})

// 스트림 종료
writeStream.end()
