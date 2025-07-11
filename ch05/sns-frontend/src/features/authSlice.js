import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { registerUser } from '../api/snsApi'

/* 
?(optional chaining)
error = { } // response: undefined
error.response.data 사용시, TypeError 발생! (Cannot read property 'data' of undefined)
error.response?.data?.message 사용시 response와 data가 undefined여도 에러가 발생하지 X
*/

// rejectWithValue(에러메세지): 에러메세지를 rejected에 action.payload로 전달할때 사용

//회원가입
export const registerUserThunk = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
   // userData: 회원가입 정보
   try {
      const response = await registerUser(userData)
      return response.data.user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message)
   }
})

const authSlice = createSlice({
   name: 'auth',
   initialState: {
      user: null, // 사용자 정보 객체
      isAuthenticated: false, // 로그인 상태(true: 로그인, false: 로그아웃)
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      builder
         // 회원가입
         .addCase(registerUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(registerUserThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
         })
         .addCase(registerUserThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload // 이미 존재하는 사용자입니다
         })
   },
})

export default authSlice.reducer
