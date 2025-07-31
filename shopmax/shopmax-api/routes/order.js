const express = require('express')
const router = express.Router()
const { sequelize } = require('../models')
const { Order, Item, User, OrderItem, Img } = require('../models')
const { isLoggedIn, verifyToken } = require('./middlewares')
const { Op, col } = require('sequelize')

// 주문
router.post('/', verifyToken, isLoggedIn, async (req, res, next) => {
   try {
      /* 
          ★트랜잭션 처리: 주문 처리 중 에러 발생시 차감된 재고를 복구하지 않으면 데이터가 불일치 상태가 되므로 트랜잭션 처리
  
          <아래 3가지 쪼갤 수 없는 업무 단위인 트랜잭션으로 묶임, 3가지 중 하나에서 문제 발생시 3가지 모두 취소됨(롤백)>
          - Order 테이블에 주문내역 insert
          - Item 테이블에서 재고 차감
          - OrderItem 테이블에 주문상품 insert
          */

      const transaction = await sequelize.transaction() // 하나의 트랜잭션

      // 주문 상품 목록 데이터
      // req.body = { items: [{itemId: 1, count: 2 }, {itemId: 2, count: 1 }] }
      const { items } = req.body

      // 회원 확인(주문은 회원만 가능)
      const user = await User.findByPk(req.user.id)
      if (!user) {
         const error = new Error('회원이 존재하지 않습니다.')
         error.status = 404
         return next(error)
      }

      // 1. Order 테이블에 주문내역 insert
      const order = await Order.create(
         {
            userId: user.id, // 주문자 id(user 테이블의 pk)
            orderDate: new Date(), // 현재 날짜와 시간
            orderStatus: 'ORDER', // 주문 상태
         },
         { transaction } // 하나의 트랜잭션으로 묶을 작업에 {transaction} 작성
      )

      // 2. Item  테이블에서 재고 차감
      let totalOrderPrice = 0 // 총 주문 상품 가격

      /* 
       Promise.all() : 비동기 작업들을 병렬실행(여러작업을 동시 실행)을 통해 성능을 최적화

       각 비동기 작업 asyne(item)=>{...}을 병렬로 실행한다
       아래와 같이 for문을 이용해 처리하는 것은 성능상 효율적이지 X(고객이 여러개의 상품을 한번에 주문할 수 있으므로)
       다만, 단순하게 findByPk만 한다면 아래와 같이 처리해도 괜찮음
       하지만 상품확인, 재고차감, 재고 updata 등 여러가지 일을 한번에 처리하므로 비동기+병렬 처리 방식을 추천

       for(const item of items){
            const product = await Item.findByPk(item.itemId, {transaction})
            ...
            ...
        }
       */

      const orderItemsData = await Promise.all(
         items.map(async (item) => {
            // 1. 주문한 상품이 있는지 화인
            const product = await Item.findByPk(item.itemId, { transaction })

            if (!product) {
               throw new Error(`상품 id: ${item.itemId}인 상품이 존재하지 않습니다.`)
            }

            // 2. 주문한 상품의 재소가 있는지 확인 후 재고 차감

            // 재고가 주문한 상품의 수량보다 적다며
            if (product.stockNumber < item.count) {
               throw new Error(`상품 id: ${item.itemId}인 상품의 재고가 부족합니다.`)
            }

            product.stockNumber -= item.count

            // 3. 재고차감 후 item 테이블에 재고 update
            await product.save({ transaction })

            // 4. 총 주문 상품 가격 누적합산
            const orderItemPrice = product.price * item.count
            totalOrderPrice += orderItemPrice

            // 5. orderItems 테이블에 insert 해줄 객체를 return
            return {
               orderId: order.id,
               itemId: product.id,
               orderPrice: orderItemPrice,
               count: item.count,
            }
         })
      )

      // 3. OrderItem 테이블에 주문 상품 insert
      await OrderItem.bulkCreate(orderItemsData, { transaction })

      await transaction.commit()

      res.status(201).json({
         success: true,
         message: '주문이 성공적으로 생성되었습니다.',
         orderId: order.id,
         totalPrice: totalOrderPrice,
      })
   } catch (error) {
      error.status = 500
      error.message = error.message || '상품 주문 중 오류가 발생했습니다.'
      next(error)
   }
})

/**
 * @swagger
 * /order/list:
 *   get:
 *     summary: 주문 목록 조회(페이징 및 날짜 검색)
 *     tags: [Order]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 시작 날짜
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 종료 날짜
 *     responses:
 *         200:
 *          description: 주문 목록 조회 성공
 *         500:
 *          description: 서버 오류
 */
router.get('/list', verifyToken, isLoggedIn, async (req, res, next) => {
   try {
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 5
      const offset = (page - 1) * limit
      const startDate = req.query.startDate // YYYY-MM-DD 00:00:00
      const endDate = req.query.endDate
      const endDateTime = `${endDate} 23:59:59` // 년월일만 받을시 시분초는 00:00:00으로 인식하므로 시간 변경(endDate 날짜에 주문한 내용도 검색되도록)

      const count = await Order.count({
         where: {
            userId: req.user.id,
            ...(startDate && endDate
               ? {
                    orderDate: { [Op.between]: [startDate, endDateTime] },
                 }
               : {}),
         },
      })

      const orders = await Order.findAll({
         where: {
            userId: req.user.id,
            ...(startDate && endDate
               ? {
                    orderDate: { [Op.between]: [startDate, endDateTime] },
                 }
               : {}),
         },
         limit,
         offset,
         include: [
            {
               model: Item,
               attributes: ['id', 'itemNm', 'price'],
               // 교차테이블 데이터(OrderItem 테이블에서 필요한 컬럼 선택)
               through: {
                  attributes: ['count', 'orderPrice'],
               },
               include: [
                  {
                     model: Img,
                     attributes: ['imgUrl'],
                     where: { repImgYn: 'Y' },
                  },
               ],
            },
         ],
         order: [['orderDate', 'DESC']],
      })

      res.json({
         success: true,
         message: '주문 목록 조회 성공',
         orders,
         pagination: {
            totalOrders: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            limit,
         },
      })
   } catch (error) {
      error.status = 500
      error.message = '주문 내역을 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

/**
 * @swagger
 * /order/cancel/{id}:
 *   post:
 *     summary: 주문 취소
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 주문 id
 *     responses:
 *       200:
 *         description: 주문 취소 성공
 *       404:
 *         description: 주문 없음
 *       400:
 *         description: 이미 취소된 주문
 *       500:
 *         description: 서버 오류
 */
router.post('/cancel/:id', verifyToken, isLoggedIn, async (req, res, next) => {
   try {
      const transaction = await sequelize.transaction()

      const id = req.params.id
      const order = await Order.findByPk(id, {
         include: [
            {
               model: OrderItem,
               include: [{ model: Item }],
            },
         ],
      })

      // 주문내역이 없다면
      if (!order) {
         const error = new Error('주문내역이 존재하지 않습니다.')
         error.status = 404
         return next(error)
      }

      // 이미 취소된 주문이라면
      if (order.orderStatus === 'CANCEL') {
         const error = new Error('이미 취소된 주문입니다.')
         error.status = 400
         return next(error)
      }

      // 1. 재고 복구
      for (const orderItem of order.OrderItems) {
         const product = orderItem.Item
         product.stockNumber += orderItem.count
         await product.save({ transaction })
      }

      // 2. 주문 상태 변경
      order.orderStatus = 'CANCEL'
      await order.save({ transaction })

      await transaction.commit()

      res.json({
         success: true,
         message: '주문이 성공적으로 취소되었습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '주문 취소 중 오류가 발생했습니다.'
      next(error)
   }
})

// 주문 삭제
router.delete('/delete/:id', verifyToken, isLoggedIn, async (req, res, next) => {
   try {
      const id = req.params.id
      const order = await Order.findByPk(id)

      // 주문내역이 없다면
      if (!order) {
         const error = new Error('주문내역이 존재하지 않습니다.')
         error.status = 404
         return next(error)
      }

      // 주문 삭제(연관된 OrderItem도 삭제됨)
      await Order.destroy({ where: { id: order.id } })

      res.json({
         success: true,
         message: '주문 내역이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '주문 삭제 중 오류가 발생했습니다.'
      next(error)
   }
})

// 주문 목록(차트용)
router.get('/chartlist', async (req, res, next) => {
   try {
      const orders = await OrderItem.findAll({
         // flat(평평하다) 형태로 컬럼값 가져오기: col + include attributes 빈배열 + raw값 true
         // 하나의 객체에 합쳐서 가져온다
         attributes: ['orderId', 'itemId', 'count', 'orderPrice', [col('Item.itemNm'), 'itemNm'], [col('Item.price'), 'price']],
         include: [
            {
               model: Item,
               attributes: [],
            },
         ],
         raw: true,
      })

      res.json({
         success: true,
         message: '주문 목록 조회 성공',
         orders,
      })
   } catch (error) {
      error.status = 500
      error.message = '주문 내역을 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

module.exports = router
