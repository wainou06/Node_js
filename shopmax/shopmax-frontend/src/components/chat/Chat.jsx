import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { TextField, Button, Box } from '@mui/material'

// 소켓 서버와 연결
const socket = io(import.meta.env.VITE_APP_API_URL, {
   withCredentials: true, // 소켓에서 세션을 사용하므로 쿠키를 포함해서 세션 유지
})

function Chat() {
   const [messages, setMessages] = useState([]) // 소켓 서버에서 전달받은 채팅 메세지
   const [input, setInput] = useState('') // 입력 메세지
   const [user, setUser] = useState(null) // 소켓 서버에서 전달받은 사용자의 정보

   useEffect(() => {
      // 소켓서버에서 사용자 정보를 얻기위해 메세지 전송
      socket.emit('user info', 'requestUserinfo')

      // 서버에서 사용자 정보 가져오기
      socket.on('user info', (userInfo) => {
         console.log('user info: ', userInfo)
         setUser(userInfo)
      })

      // 컴포넌트 언마운트 시 이벤트 제거
      return () => {
         socket.off('user info')
      }
   }, [])

   return (
      <Box
         sx={{
            width: 400,
            margin: '0 auto',
            border: '1px solid #ccc',
            borderRadius: 2,
            padding: 2,
         }}
      >
         <h2>채팅</h2>
         <Box
            sx={{
               height: 300,
               overflowY: 'auto',
               border: '1px solid #ccc',
               borderRadius: 1,
               padding: 1,
               marginBottom: 2,
            }}
         ></Box>
         <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
               fullWidth
               variant="outlined"
               placeholder="메시지를 입력하세요"
               sx={{
                  marginRight: 1,
                  '& .MuiInputBase-input': {
                     padding: '8px', // 원하는 패딩 값
                  },
               }}
            />
            <Button variant="contained" color="primary" sx={{ flexShrink: 0 }}>
               전송
            </Button>
         </Box>
      </Box>
   )
}

export default Chat
