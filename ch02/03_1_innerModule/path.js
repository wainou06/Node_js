const path = require('path')

console.log('경로 정보 정리---------------------')
console.log(path.sep) // os별로 경로의 구분자를 알려줌

const string = __filename
console.log(string)

console.log('경로 분석-----------------------')
console.log(path.dirname(string)) // 폴더경로
console.log(path.extname(string)) // 파일의 확장자
console.log(path.basename(string)) // 파일의 이름 표시
console.log(path.basename(string, '.js')) // 파일의 이름에서 확장자 제거

console.log('경로 조작--------------------------')
console.log(path.parse(string)) // 파일경로 분리
console.log(
   // parse한 경로를 다시 합친다
   path.format({
      root: 'C:\\',
      dir: 'C:\\Users\\user\\project\\04. Nodejs\\study\\ch02\\03_1_innerModule',
      base: 'path.js',
      ext: '.js',
      name: 'path',
   })
)

// 슬래시나 역슬래시를 실수로 사용하거나 여러번 사용했을때 정상적인 결과를 줌
console.log(path.normalize('C://project//node_class\\ch02\\03_1_innerModule'))

console.log('경로 성격 확인--------------------')
// 절대경로인지 상대경로인지 알려줌
console.log(path.isAbsolute('C:\\'))
console.log(path.isAbsolute('./home'))

console.log('경로 계산----------------------')
// 경로 두개 중 첫번째 경로에서 두번째 경로로 가는 법을 알려줌
console.log(path.relative('C:\\project\\node_class\\ch02\\03_1_innerModule\\path.js', 'C:\\'))

console.log(path.join('C:project/node', '/users', '/ezen'))
