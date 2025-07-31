const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Op } = require('sequelize')
const { Item, Img } = require('../models')
const { isAdmin, verifyToken } = require('./middlewares')
const router = express.Router()

// uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') //폴더 생성
}

// 이미지 업로드를 위한 multer 설정
const upload = multer({
   // 저장할 위치와 파일명 지정
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/') // uploads폴더에 저장
      },
      filename(req, file, cb) {
         const decodedFileName = decodeURIComponent(file.originalname) //파일명 디코딩(한글 파일명 깨짐 방지) => 제주도.jpg
         const ext = path.extname(decodedFileName) //확장자 추출
         const basename = path.basename(decodedFileName, ext) //확장자 제거한 파일명 추출

         // 파일명 설정: 기존이름 + 업로드 날짜시간 + 확장자
         // dog.jpg
         // ex) dog + 1231342432443 + .jpg
         cb(null, basename + Date.now() + ext)
      },
   }),
   // 파일의 크기 제한
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB로 제한
})

/**
 * @swagger
 * /item:
 *   post:
 *     summary: 상품 등록
 *     tags: [Item]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *                itemNm:
 *                   type: string
 *                   description: 상품명
 *                price:
 *                   type: number
 *                   description: 가격
 *                itemDetail:
 *                   type: string
 *                   description: 상품 상세
 *                itemSellStatus:
 *                   type: string
 *                   description: 판매상태(SELL, SOLD_OUT)
 *                img:
 *                   type: array
 *                   items:
 *                      type: string
 *                      format: binary
 *                   description: 업로드 이미지 파일 목록(최대 5개)
 *     responses:
 *          201:
 *             description: 상품 등록 성공
 *          400:
 *             description: 파일 업로드 실패
 *          500:
 *             description: 서버 오류
 */
router.post('/', verifyToken, isAdmin, upload.array('img'), async (req, res, next) => {
   try {
      // 업로드된 파일 확인
      if (!req.files) {
         const error = new Error('파일 업로드에 실패했습니다.')
         error.status = 400
         return next(error)
      }

      // 상품(item) insert
      const { itemNm, price, stockNumber, itemDetail, itemSellStatus } = req.body

      const item = await Item.create({
         itemNm,
         price,
         stockNumber,
         itemDetail,
         itemSellStatus,
      })

      // 이미지(img) insert
      /*
         req.files = [file1, file2, file3 ...]

         file1 = {
            originalname: 'dog.png',
            filename: 'dog113232232.png'
            ...
         }
       */
      // imgs 테이블에 insert할 객체 생성
      const images = req.files.map((file) => ({
         oriImgName: file.originalname, // 원본 이미지명
         imgUrl: `/${file.filename}`, //이미지 경로
         repImgYn: 'N', // 기본적으로 'N' 설정
         itemId: item.id, // 생성된 상품 ID 연결
      }))

      // 첫 번째 이미지는 대표 이미지로 설정
      if (images.length > 0) images[0].repImgYn = 'Y'

      // 이미지 여러개 insert
      await Img.bulkCreate(images)

      res.status(201).json({
         success: true,
         message: '상품이 성공적으로 등록되었습니다.',
         item,
         images,
      })
   } catch (error) {
      error.status = 500
      error.message = '상품 등록 중 오류가 발생했습니다.'
      next(error)
   }
})

// localhost:8000/item?page=1&limit=3&sellCategory=SELL&searchTerm=가방&searchCategory=itemNm => 판매중인 상품 중에서 상품명 '가방 '으로 검색

// localhost:8000/item?page=1&limit=3&sellCategory=SOLD_OUT&searchTerm=가방&searchCategory=itemDetail => 품절된 상품 중에서 상품설명 '가방'으로 검색

// 전체 상품 불러오기(페이징, 검색 기능)
router.get('/', verifyToken, async (req, res, next) => {
   try {
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 5
      const offset = (page - 1) * limit

      // 판매상태, 상품명, 상품설명 값 가져오기
      const searchTerm = req.query.searchTerm || '' // 사용자가 입력한 검색어
      const searchCategory = req.query.searchCategory || 'itemNm' // 상품명 or 상품설명으로 검색
      const sellCategory = req.query.sellCategory // 판매상태('SELL' 또는 'SOLE_OUT'만 존재)

      // 조건부 where 절을 만드는 객체
      const whereClause = {
         // serchTerm이 존재하면 해당 검색어(searchTerm)가 포함된 검색 범주(searchCategory)를 조건으로 추가
         // => itemDetail like '%가방%' 혹은 itemNm like %가방%
         ...(searchTerm && {
            [searchCategory]: {
               [Op.like]: `%${searchTerm}%`,
            },
         }),

         // sellCategory가 존재하면 itemSellStatus가 해당 판매 상태와 일치하는 항목을 조건으로 추가
         // => itemSellStatus = 'SOLE_OUT' 혹은 'SELL'
         ...(sellCategory && {
            itemSellStatus: sellCategory,
         }),
      }

      // localhost:8000/item?page=1&limit=3&sellCategory=SOLD_OUT&searchTerm=가방&searchCategory=itemDetail => 품절된 상품 중에서 상품설명 '가방'으로 검색

      /*
         whereClause = {
         itemDetail: {
            [Op.like]: '%가방%'
         },
         {itemSellStatus: 'SOLD_OUT'}
         }
      */

      // 전체 상품 갯수
      const count = await Item.count({
         where: whereClause,
      })

      const items = await Item.findAll({
         where: whereClause,
         limit,
         offset,
         order: [['createdAt', 'DESC']],
         include: [
            {
               model: Img,
               attributes: ['id', 'oriImgName', 'imgUrl', 'repImgYn'],
            },
         ],
      })

      res.json({
         success: true,
         message: '상품 목록 조회 성공',
         items,
         pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            limit,
         },
      })
   } catch (error) {
      error.status = 500
      error.message = '전체 상품 리스트를 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

// 상품 삭제
router.delete('/:id', verifyToken, isAdmin, async (req, res, next) => {
   try {
      const id = req.params.id // 상품 id

      // 상품이 존재하는지 확인
      const item = await Item.findByPk(id) // pk 키로 검색

      // 상품이 존재하지 않으면
      if (!item) {
         const error = new Error('상품을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // 상품 삭제 (연관된 이미지도 삭제된다 - CASCADE 설정)
      await item.destroy()

      res.json({
         success: true,
         message: '상품이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '상품 삭제 중 오류가 발생했습니다.'
      next(error)
   }
})

// 특정 상품 불러오기
router.get('/:id', verifyToken, async (req, res, next) => {
   try {
      const id = req.params.id

      const item = await Item.findOne({
         where: { id },
         include: [
            {
               model: Img,
               attributes: ['id', 'oriImgName', 'imgUrl', 'repImgYn'],
            },
         ],
      })

      if (!item) {
         const error = new Error('해당 상품을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      res.json({
         success: true,
         message: '상품 조회 성공',
         item,
      })
   } catch (error) {
      error.status = 500
      error.message = '상품을 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

/**
 * @swagger
 * /item/{id}:
 *   put:
 *     summary: 상품 수정
 *     tags: [Item]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               itemNm:
 *                 type: string
 *                 description: 상품명
 *               price:
 *                 type: number
 *                 description: 가격
 *               stockNumber:
 *                 type: integer
 *                 description: 상품 상세
 *               itemDetail:
 *                 type: string
 *                 description: 판매상태(SELL, SOLD_OUT)
 *               itemSellStatus:
 *                 type: string
 *               img:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 업로드 이미지 파일 목록(최대 5개)
 *     responses:
 *       201:
 *         description: 상품 등록 성공
 *       400:
 *         description: 파일 업로드 실패
 *       500:
 *         description: 서버 오류
 */
router.put('/:id', verifyToken, isAdmin, upload.array('img'), async (req, res, next) => {
   try {
      const id = req.params.id
      const { itemNm, price, stockNumber, itemDetail, itemSellStatus } = req.body

      // 상품이 존재하는지 확인
      const item = await Item.findByPk(id)

      if (!item) {
         const error = new Error('해당 상품을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      await item.update({
         itemNm,
         price,
         stockNumber,
         itemDetail,
         itemSellStatus,
      })

      // 수정할 이미지가 존재하는 경우
      if (req.files && req.files.length > 0) {
         // 기존 이미지 삭제
         await Img.destroy({ where: { itemId: id } })

         // 새 이미지 추가
         const images = req.files.map((file) => ({
            oriImgName: file.originalname, // 원본 이미지명
            imgUrl: `/${file.filename}`, //이미지 경로
            repImgYn: 'N', // 기본적으로 'N' 설정
            itemId: item.id, // 생성된 상품 ID 연결
         }))

         // 첫 번째 이미지는 대표 이미지로 설정
         if (images.length > 0) images[0].repImgYn = 'Y'

         // 이미지 여러개 insert
         await Img.bulkCreate(images)
      }

      res.json({
         success: true,
         message: '상품과 이미지가 성공적으로 수정되었습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '상품 수정 중 오류가 발생했습니다.'
      next(error)
   }
})

module.exports = router
