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

// 상품 삭제
export const deleteItem = async (id) => {
   try {
      const response = await shopmaxApi.delete(`/item/${id}`)
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error}`)
      throw error
   }
}

// 특정 상품 불러오기
export const getItemById = async (id) => {
   try {
      const response = await shopmaxApi.get(`/item/${id}`)
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error}`)
      throw error
   }
}

// 상품 수정
export const updateItem = async (id, itemData) => {
   try {
      const config = {
         headers: {
            'Content-Type': 'multipart/form-data', // 파일 전송시 반드시 지정
         },
      }

      const response = await shopmaxApi.put(`/item/${id}`, itemData, config)
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error}`)
      throw error
   }
}
