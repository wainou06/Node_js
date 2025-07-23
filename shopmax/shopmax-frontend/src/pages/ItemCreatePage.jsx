import { Container } from '@mui/material'
import ItemCreateForm from '../components/item/ItemCreateForm'

import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createItemThunk } from '../features/itemSlice'

function ItemCreatePage() {
   const dispatch = useDispatch()
   const navigate = useNavigate()

   // 상품등록
   const onCreateSubmit = (itemData) => {
      dispatch(createItemThunk(itemData))
         .unwrap()
         .then(() => {
            navigate('/items/createlist') // 등록 후 상품등록 리스트 페이지로 이동
         })
         .catch((error) => {
            console.error('상품 등록 에러: ', error)
            alert('상품 등록에 실패 했습니다.' + error)
         })
   }

   return (
      <Container maxWidth="md" sx={{ marginTop: 10, marginBottom: 13 }}>
         <h1>상품 등록</h1>
         <ItemCreateForm onCreateSubmit={onCreateSubmit} />
      </Container>
   )
}

export default ItemCreatePage
