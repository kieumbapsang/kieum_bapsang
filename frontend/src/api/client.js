

// 비동기 응답을 시뮬레이션하는 함수
const asyncResponse = (data, error = null, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (error) {
        resolve({ data: null, error });
      } else {
        resolve({ data, error: null });
      }
    }, delay);
  });
};

// API 요청 함수들
export const api = {
  
  // 식사 관련
  meals: {
    // 특정 날짜의 식사 목록 조회
    getMealsByDate: async (date, userId = null) => {
      try {
        const url = userId 
          ? `http://localhost:8000/meals/${date}?user_id=${userId}`
          : `http://localhost:8000/meals/${date}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('식사 목록 조회 오류:', error);
        return { data: null, error: error.message };
      }
    },
    
    // 식사 추가
    addMeal: async (mealData, userId = null) => {
      try {
        const url = userId 
          ? `http://localhost:8000/meals?user_id=${userId}`
          : 'http://localhost:8000/meals';
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mealData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('식사 추가 오류:', error);
        return { data: null, error: error.message };
      }
    },
    
    // 식사 수정
    updateMeal: async (id, mealData) => {
      try {
        const response = await fetch(`http://localhost:8000/meals/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mealData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('식사 수정 오류:', error);
        return { data: null, error: error.message };
      }
    },
    
    // 식사 삭제
    deleteMeal: async (id) => {
      try {
        const response = await fetch(`http://localhost:8000/meals/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return { data: result, error: null };
      } catch (error) {
        console.error('식사 삭제 오류:', error);
        return { data: null, error: error.message };
      }
    },
    
    // 식사 상세 조회
    getMealById: async (id) => {
      try {
        const response = await fetch(`http://localhost:8000/meals/detail/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('식사 조회 오류:', error);
        return { data: null, error: error.message };
      }
    },
    
    // 식사 요약 조회
    getMealSummary: async (date, userId = null) => {
      try {
        const url = userId 
          ? `http://localhost:8000/meals/summary/${date}?user_id=${userId}`
          : `http://localhost:8000/meals/summary/${date}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('식사 요약 조회 오류:', error);
        return { data: null, error: error.message };
      }
    },
  },
  
  // 영양 정보 관련
  nutrition: {
    getNutritionData: async (userId) => {
      return asyncResponse([]);
    },
    
    // 연령대별 평균 영양소 섭취량 조회
    getAverageNutrition: async (ageGroup) => {
      try {
        const response = await fetch(`http://localhost:8000/nutrition/average/${ageGroup}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('평균 영양소 조회 오류:', error);
        return { data: null, error: error.message };
      }
    },
    
    // 모든 연령대별 평균 영양소 섭취량 조회
    getAllAverageNutrition: async () => {
      try {
        const response = await fetch('http://localhost:8000/nutrition/average');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('모든 평균 영양소 조회 오류:', error);
        return { data: null, error: error.message };
      }
    },

    // 사용자 영양소와 평균 비교
    compareUserNutrition: async (userId, targetDate) => {
      try {
        const response = await fetch(`http://localhost:8000/nutrition/compare/${userId}/${targetDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('영양소 비교 오류:', error);
        return { data: null, error: error.message };
      }
    },

    // 영양소 기록 생성
    createNutritionRecord: async (userId, foodName, nutritionData, intakeDate = null) => {
      try {
        const url = intakeDate 
          ? `http://localhost:8000/nutrition/records?user_id=${userId}&food_name=${encodeURIComponent(foodName)}&intake_date=${intakeDate}`
          : `http://localhost:8000/nutrition/records?user_id=${userId}&food_name=${encodeURIComponent(foodName)}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nutritionData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('영양소 기록 생성 오류:', error);
        return { data: null, error: error.message };
      }
    },

    // 영양소 기록 조회
    getNutritionRecords: async (userId, targetDate) => {
      try {
        const response = await fetch(`http://localhost:8000/nutrition/records/${userId}/${targetDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('영양소 기록 조회 오류:', error);
        return { data: null, error: error.message };
      }
    },
  },
  
  // 상점 관련
  stores: {
    getStores: async () => {
      return asyncResponse([]);
    },
    getStoreById: async (id) => {
      return asyncResponse(null, '상점을 찾을 수 없습니다.');
    },
  },

  // OCR 관련
  ocr: {
    // 파일 업로드를 통한 OCR 처리
    uploadImage: async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8000/ocr/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return { data: result, error: null };
      } catch (error) {
        console.error('OCR 업로드 오류:', error);
        return { data: null, error: error.message };
      }
    },

  },
};