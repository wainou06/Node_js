import { TextField, Button, Container, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { useDispatch, useSelector } from 'react-redux'
import { getTokenThunk, readTokenThunk } from '../../features/tokenSlice'
import { useEffect } from 'react'

function Token() {
   const dispatch = useDispatch()
   const { token, error } = useSelector((state) => state.token)

   useEffect(() => {
      dispatch(readTokenThunk())
   }, [dispatch])

   const handleToken = () => {
      dispatch(getTokenThunk())
   }

   // 읽기 전용으로 만들기
   const StyledTextField = styled(TextField)(() => ({
      '& .Mui-readOnly': {
         backgroundColor: '#f5f5f5',
         cursor: 'not-allowed',
      },
   }))

   return (
      <Container maxWidth="sm">
         <Typography variant="h4" gutterBottom>
            Token 발급받기
         </Typography>

         {error && (
            <Typography color="error" align="center">
               {error}
            </Typography>
         )}

         <Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }} onClick={handleToken}>
            Token 발급받기
         </Button>

         <StyledTextField sx={{ width: '100%' }} value={token || ''}></StyledTextField>
      </Container>
   )
}

export default Token
;<></>
