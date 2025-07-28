import './styles/common.css'

import { Route, Routes, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Navbar from './components/shared/Navbar'
import Footer from './components/shared/Footer'
import Home from './pages/Home'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ItemCreatePage from './pages/ItemCreatePage'
import ItemListPage from './pages/ItemListPage'
import ItemEditPage from './pages/ItemEditPage'
import ItemSellDetailPage from './pages/ItemSellDetailPage'
import MyOrderListPage from './pages/MyOrderListPage'
import TokenPage from './pages/TokenPage'
import ChatPage from './pages/ChatPage'

import { useEffect } from 'react'
import { checkAuthStatusThunk } from './features/authSlice'

function App() {
   const dispatch = useDispatch()
   const location = useLocation()
   const { isAuthenticated, user } = useSelector((state) => state.auth)

   useEffect(() => {
      dispatch(checkAuthStatusThunk())
   }, [dispatch])

   return (
      <>
         <Navbar isAuthenticated={isAuthenticated} user={user} />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* 상품 리스트 */}
            {/* navigate로 상품리스트 페이지 이동시 key값 덕분에 언마운트 후 마운트 된다 */}
            <Route path="/items/createlist" element={<ItemListPage key={location.key} />} />

            {/* 상품 등록 */}
            <Route path="/items/create" element={<ItemCreatePage />} />

            {/* 상품 수정 */}
            <Route path="/items/edit/:id" element={<ItemEditPage />} />

            {/* 상품 상세페이지 */}
            <Route path="/items/detail/:id" element={<ItemSellDetailPage />} />

            {/* 주문내역 페이지 */}
            <Route path="/myorderlist" element={<MyOrderListPage />} />

            {/* 토큰 발급 페이지 */}
            <Route path="/token" element={<TokenPage />} />

            {/* 채팅 페이지 */}
            <Route path="/chat" element={<ChatPage />} />
         </Routes>
         <Footer />
      </>
   )
}

export default App
