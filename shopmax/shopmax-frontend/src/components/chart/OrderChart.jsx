import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getChartOrdersThunk } from '../../features/orderSlice'

function OrderChart() {
   const dispatch = useDispatch()
   const { loading, error } = useSelector((state) => state.order)
   const [chartData, setChartData] = useState([])

   useEffect(() => {
      dispatch(getChartOrdersThunk())
         .unwrap()
         // thunk 함수를 실행후엔 무조건 then을 실행하고 result를 통해 값이 있는 state를 가져올 수 있다
         .then((result) => {
            // result는 thunk 함수에서 return해주는 response.data
            console.log(result.orders) // order 슬라이스의 orders state값 가져옴

            const orders = result.orders
            const itemMap = {}

            orders.forEach((order) => {
               const name = order.itemNm // 상품명
               const count = order.count // 상품갯수

               if (!itemMap[name]) {
                  itemMap[name] = 0
               }

               itemMap[name] += count
            })

            // {신발: 3, 가방: 9, 카라티: 5, 운동화: 3, 점퍼: 3}
            console.log('itemMap: ', itemMap)

            // 객체 -> 배열 변환
            const itemSummary = Object.entries(itemMap).map(([name, totalCount]) => ({
               name,
               totalCount,
            }))

            console.log('itemSummary: ', itemSummary)
            setChartData(itemSummary)
         })
   }, [dispatch])

   if (loading) {
      return null
   }

   if (error) {
      return (
         <Typography variant="body1" align="center" color="error" mt={2}>
            에러 발생: {error}
         </Typography>
      )
   }

   return (
      <ResponsiveContainer width="100%" height="100%">
         <LineChart
            width={400}
            height={300}
            data={chartData}
            margin={{
               top: 30,
               right: 30,
               left: 20,
               bottom: 5,
            }}
         >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalCount" stroke="#8884d8" activeDot={{ r: 8 }} />
         </LineChart>
      </ResponsiveContainer>
   )
}

export default OrderChart
