const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Post, Hashtag, User } = require('../models')
const { isLoggedIn } = require('./middlewares')
const router = express.Router()

// uploads 폴더가 없을 경우 폴더 생성
try {
   fs.readdirSync('uploads') // 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') // 폴더 생성
}

// 이미지 업로드를 위한 multer 설정
const upload = multer({
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/') // 업로드 폴더에 파일 저장
      },
      filename(req, file, cb) {
         const decodeFileName = decodeURIComponent(file.originalname) // 파일명 디코딩(한글 파일명 깨짐 방지)
         const ext = path.extname(decodeFileName)
         const basename = path.basename(decodeFileName, ext)

         cb(null, basename + Date.now() + ext)
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 }, //5mb 파엘
})

// 게시물 등록 localhost:8000/post
router.post('/', isLoggedIn, upload.single('img'), async (req, res, next) => {
   try {
      console.log('파일정보:', req.file)
      console.log('formData:', req.body)

      // 업로드 된 파일이 없을 경우
      if (!req.file) {
         const error = new Error('파일 업로드에 실패했습니다.')
         error.status = 400
         return next(error)
      }

      // 게시물 등록
      const post = await Post.create({
         content: req.body.content, // 게시물 내용
         img: `/${req.file.filename}`, // 이미지 url(파일명)
         user_id: req.user.id, // 작성자 id(pk)
      })

      // 해시태그 등록
      // req.body.hashtags = '#여행 #맛집'
      const hashtags = req.body.hashtags.match(/#[^\s#]*/g) // #을 기준으로 해시태그 추출
      // hashtags = ['#여행', '#맛집']

      // 추출된 해시태그가 있으면
      if (hashtags) {
         // Promise.all: 여러개의 비동기 작업을 병렬로 처리
         // 병렬 처리: 동시에 여러개의 작업 실행

         const result = await Promise.all(
            hashtags.map((tag) =>
               /* 
            findOrCreate() 함수는 map()함수 안에서 실행하므로 비동기적으로 여러번 실행된다. Promise.all 처리를 하면
            findOrCreate() 함수는 비동기적 + 병렬처리(동시작업)로 실행됨 -> 장점. 속도가 빨라짐
            무조건 해야하는 것은 X
            */
               // findOrCreate: where절에 찾는 값이 존재하는지 확인하고 없으면 create
               Hashtag.findOrCreate({
                  where: { title: tag.slice(1) }, // #을 제외한 문자만
               })
            )
         )

         // posthashtag 테이블에 insert

         /*
         HashTagInstance1 = {
            id: 1,
            title: 여행,
            createAt: '2024-12-16T10:10:10',
            updateAt: '2024-12-16T10:10:10',
            }
            
        HashTagInstance2 = {
           id: 2,
           title: 맛집,
           createAt: '2024-12-16T10:10:12'
           updateAt: '2024-12-16T10:10:12',
           }
                
                
        result = [
            [HashTagInstance1, true] // #여행 해시 태그가 새로 생성됨(false 라면 이미 존재하는 해시태그)
            [HashTagInstance2, true] // #맛집 해시 태그가 새로 생성됨
                ]
                    
        
        r[0] = HashTagInstance1
        r[0] = HashTagInstance2
                    */

         // 연관메서드 addHashtags(): HashtagInstance값을 이용해 hashtag객체를 insert할때 이 과정에서 posthashtag 테이블의 post_id와 hashtag_id의 컬럼에 값이 자동으로 insert된다
         await post.addHashtags(result.map((r) => r[0]))
      }

      res.status(200).json({
         success: true,
         post: {
            id: post.id,
            content: post.content,
            img: post.img,
            userID: post.user_id,
         },
         message: '게시물이 성공적으로 등록되었습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '게시물 등록 중 오류가 발생했습니다.'
      next(error)
   }
})

// 게시물 수정 localhost:8000/post/:id
router.put('/:id', isLoggedIn, upload.single('img'), async (req, res, next) => {
   try {
      // 1. 게시물 존재 여부 확인
      const post = await Post.findOne({
         where: { id: req.params.id, user_id: req.user.id },
      })

      // 게시물이 존재하지 않는다면
      if (!post) {
         const error = new Error('게시물을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // post 테이블 수정
      await post.update({
         content: req.body.content,
         img: req.file ? `/${req.file.filename}` : post.img, // 수정된 이미지가 있으면 바꿈
      })

      const hashtags = req.body.hashtags.match(/#[^\s#]*/g) // #을 기준으로 해시태그 추출

      if (hashtags) {
         const result = await Promise.all(
            // hashtags 테이블 수정
            hashtags.map((tag) =>
               Hashtag.findOrCreate({
                  where: { title: tag.slice(1) }, //#을 제외한 문자만
               })
            )
         )

         // posthashtag 테이블(교차테이블) 수정
         await post.setHashtags(result.map((r) => r[0]))
      }

      // 수정한 게시물 다시 조회(선택사항)
      const updatedPost = await Post.findOne({
         where: { id: req.params.id },
         include: [
            {
               model: User,
               attributes: ['id', 'nick'],
            },
            {
               model: Hashtag,
               attributes: ['title'],
            },
         ],
      })

      res.status(200).json({
         success: true,
         post: updatedPost,
         message: '게시물이 성공적으로 수정되었습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '게시물 수정 중 오류가 발생했습니다.'
      next(error)
   }
})

// 게시물 삭제 localhost:8000/post/:id
router.delete('/:id', isLoggedIn, async (req, res, next) => {
   try {
   } catch (error) {
      error.status = 500
      error.message = '게시물 삭제 중 오류가 발생했습니다.'
      next(error)
   }
})

// 특정 게시물 불러오기 localhost:8000/post/:id
router.get('/:id', async (req, res, next) => {
   try {
      const post = await Post.findOne({
         where: { id: req.params.id },
         include: [
            {
               model: User,
               attributes: ['id', 'nick'],
            },
            {
               model: Hashtag,
               attributes: ['title'],
            },
         ],
      })

      // 게시물을 가져오지 못했을때
      if (!post) {
         const error = new Error('게시물을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      res.status(200).json({
         success: true,
         post,
         message: '게시물을 성공적으로 불러왔습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '특정 게시물을 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

// 전체 게시물 (페이징 기능) localhost:8000/post?page=1&limit=3
router.get('/', async (req, res, next) => {
   try {
      // parseIng('08', 10) -> 10진수 8을 반환
      const page = parseInt(req.query.page, 10) || 1 // page 번호(기본값 1)
      const limit = parseInt(req.query.limit, 10) || 3 // 한페이지당 나타낼 게시물 갯수(기본값 3)
      const offset = (page - 1) * limit // 오프셋 계산

      // 1. 게시물 레코드의 전체 갯수 가져오기
      /* 
       page=1, limit=3, offset=0 -> 0개의 레코드를 건너띄고 3개의 최신 레코드를 가져온다
       select * from posts order by createdAt DESC limit 3 offset 0;

       page=2, limit=3, offset=3 -> 3개의 레코드를 건너띄고 4번째부터 3개의 최신 레코드를 가져온다
       select * from posts order by createdAt DESC limit 3 offset 3;

       page=3, limit=3, offset=6 -> 6개의 레코드를 건너띄고 7번째부터 3개의 최신 레코드를 가져온다
       */

      const count = await Post.count()

      // 2. 게시물 레코드 가져오기
      const posts = await Post.findAll({
         limit,
         offset,
         order: [['createdAt', 'DESC']], // 게시물을 최근 날짜 순으로 가져온다
         // 게시글 작성한 사람과 게시글에 작성된 해시태그를 같이 가져온다
         include: [
            {
               model: User,
               attributes: ['id', 'nick', 'email'],
            },
            {
               model: Hashtag,
               attributes: ['title'],
            },
         ],
      })

      console.log('posts: ', posts)

      res.status(200).json({
         success: true,
         posts,
         pagination: {
            totalPosts: count, // 전체 게시물 수
            currentPage: page, // 현재 페이지
            totalPages: Math.ceil(count / limit), // 총 페이지 수
            limit, // 페이지당 게시물 수
         },
         message: '전체 게시물 리스트를 성공적으로 불러왔습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '게시물 리스트를 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

module.exports = router
