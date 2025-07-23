import { Box, Typography, Button, Alert, CardMedia } from '@mui/material'
import Grid from '@mui/material/Grid'
import LocalMallIcon from '@mui/icons-material/LocalMall'
import NumberInput from '../../styles/NumberInput'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchItemByIdThunk } from '../../features/itemSlice'
import { formatWithComma } from '../../utils/priceSet'

function ItemSellDetail() {
   const { id } = useParams()
   const disPatch = useDispatch()
   const { item, error, loading } = useSelector((state) => state.items)

   useEffect(() => {
      disPatch(fetchItemByIdThunk(id))
   }, [disPatch, id])

   return (
      <>
         {item && (
            <Box sx={{ padding: '20px' }}>
               {/* 위쪽 상세(썸네일 이미지, 가격, 수량) */}
               <Grid
                  container
                  spacing={4}
                  sx={{ justifyContent: 'center', alignItems: 'center' }} // 추가된 스타일
               >
                  <Grid container spacing={10}>
                     {/* 썸네일 대표 이미지 */}
                     <Grid xs={12} md={6}>
                        <CardMedia component="img" image={`${import.meta.env.VITE_APP_API_URL}${item.Imgs.filter((img) => img.repImgYn === 'Y')[0].imgUrl}`} alt={item.itemNm} sx={{ width: '450px', borderRadius: '8px' }} />
                     </Grid>

                     {/* 오른쪽 상세 정보 */}
                     <Grid xs={12} md={6}>
                        <Typography variant="h4" gutterBottom>
                           <LocalMallIcon sx={{ color: '#ffab40', fontSize: '32px' }} />
                           {item.itemNm}
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                           가격: {formatWithComma(String(item.price))}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                           재고: {item.stockNumber}개
                        </Typography>

                        {item.itemSellStatus === 'SOLD_OUT' ? (
                           <Alert severity="error">품절</Alert>
                        ) : (
                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
                              <NumberInput />
                              <Typography variant="h6"> 총 가격:</Typography>
                              <Button variant="contained" color="primary">
                                 구매하기
                              </Button>
                           </Box>
                        )}
                     </Grid>
                  </Grid>
               </Grid>

               {/* 상세 이미지, 상세 설명 */}
            </Box>
         )}
      </>
   )
}

export default ItemSellDetail
