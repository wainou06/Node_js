import axios from 'axios'

const BASE_URL = import.meta.env.VITE_APP_API_URL

//axios 인스턴스 생성
const snsApi = axios.create({
   baseURL: BASE_URL,
   headers: {
      'Content-Type': 'application/json', // request, response 할때 json 객체로 주고 받겠다
   },
   // request, response 주소가 다른경우 보안상 서로 통신 X
   // 주소가 다른데 통신하는 경우 cors 에러 발생
   // 주소가 다르면 쿠키와 세션도 주고받지 못하므로 아래 설정 필요
   withCredentials: true, // 세션이나 쿠키를 request에 포함
})

// 회원가입
export const registerUser = async (userData) => {
   try {
      // userDate: 회원가입 창에서 입력한 데이터
      console.log('userDate: ', userData)

      const response = await snsApi.post('/auth/join', userData)
      console.log('response: ', response)
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error.message}`)
      throw error
   }
}
