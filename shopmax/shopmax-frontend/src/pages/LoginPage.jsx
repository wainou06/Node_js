import { Container } from '@mui/material'
import Login from '../components/auth/Login'

function LoginPage() {
   return (
      <Container maxWidth="md" sx={{ marginTop: 10, marginBottom: 13 }}>
         <Login />
      </Container>
   )
}

export default LoginPage
