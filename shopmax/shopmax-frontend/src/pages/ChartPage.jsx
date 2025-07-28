import { Container, Typography } from '@mui/material'
import OrderChart from '../components/chart/OrderChart'

function ChartPage() {
   return (
      <Container maxWidth="lg" sx={{ marginTop: 10, marginBottom: 13, height: 500 }}>
         <Typography variant="h4" align="center" gutterBottom>
            주문 목록 차트
         </Typography>

         <OrderChart />
      </Container>
   )
}

export default ChartPage
