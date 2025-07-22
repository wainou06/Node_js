import shopmaxApi from './axiosApi'

// 상품 등록
export const createItem = async (itemData) => {
   try {
      // itemData: 사용자가 입력한 상품정보가 들어있는 formData 객체

      const config = {
         headers: {
            'Content-Type': 'multipart/form-data', // 파일 전송시 반드시 지정
         },
      }

      const response = await shopmaxApi.post('/item', itemData, config)
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error}`)
      throw error
   }
}

// 전체 상품 리스트 가져오기
export const getItems = async (data) => {
   try {
      const { page, limit, searchTerm = '', searchCategory = '', sellCategory = '' } = data

      const response = await shopmaxApi.get(`/item?page=${page}&limit=${limit}&searchTerm=${searchTerm}&searchCategory=${searchCategory}&sellCategory=${sellCategory}`)

      return response
   } catch (error) {
      console.error(`API Request 오류: ${error}`)
      throw error
   }
}
