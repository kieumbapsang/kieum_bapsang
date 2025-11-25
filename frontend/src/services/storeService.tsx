import { Store } from '../components/ui/kakaoMap';

// API 기본 URL 설정 (환경 변수 또는 자동 감지)
const getApiBaseUrl = () => {
  // 환경 변수가 있으면 사용
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 현재 호스트에서 포트만 변경 (모바일 접속 시 자동으로 IP 주소 사용)
  const hostname = window.location.hostname;
  const port = process.env.REACT_APP_API_PORT || '8000';
  
  // localhost가 아니면 (IP 주소로 접속한 경우) 같은 IP 사용
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:${port}`;
  }
  
  // 기본값
  return `http://localhost:${port}`;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔗 Store Service API Base URL:', API_BASE_URL);

// 모든 매장 데이터 가져오기 (시도/시군구 필터링 없이)
export const getAllStores = async (): Promise<Store[]> => {
  try {
    const url = `${API_BASE_URL}/stores`;
    console.log('API 요청 URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 에러 (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    console.warn('API 응답에 data가 없습니다:', result);
    return [];
  } catch (error) {
    console.error('매장 데이터 로드 실패:', error);
    if (error instanceof Error) {
      console.error('에러 상세:', error.message);
    }
    return [];
  }
};

// 특정 시도의 매장 데이터 가져오기
export const getStoresByCity = async (city: string): Promise<Store[]> => {
  try {
    const url = `${API_BASE_URL}/stores?province=${encodeURIComponent(city)}`;
    console.log('API 요청 URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 에러 (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    console.warn('API 응답에 data가 없습니다:', result);
    return [];
  } catch (error) {
    console.error('매장 데이터 로드 실패:', error);
    if (error instanceof Error) {
      console.error('에러 상세:', error.message);
    }
    return [];
  }
};

// 특정 시군구의 매장 데이터 가져오기
export const getStoresByDistrict = async (city: string, districts: string[]): Promise<Store[]> => {
  try {
    console.log('getStoresByDistrict 호출:', { city, districts, districtsLength: districts.length });
    
    // 시군구가 없으면 시도명으로만 조회
    if (districts.length === 0) {
      console.log('시군구가 없어서 시도명으로만 조회');
      return await getStoresByCity(city);
    }

    // 여러 시군구를 쉼표로 구분하여 전달
    const citiesParam = districts.join(',');
    const url = `${API_BASE_URL}/stores/districts?province=${encodeURIComponent(city)}&cities=${encodeURIComponent(citiesParam)}`;
    console.log('API 요청 URL:', url);
    console.log('API 요청 파라미터:', { province: city, cities: citiesParam });
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 에러 (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('getStoresByDistrict 호출 성공:', { 
        city, 
        districts, 
        count: result.data.length,
        sampleStores: result.data.slice(0, 3).map((s: any) => ({ 
          name: s.name, 
          district: s.district, 
          address: s.address 
        }))
      });
      return result.data;
    }
    
    console.warn('API 응답에 data가 없습니다:', result);
    return [];
  } catch (error) {
    console.error('매장 데이터 로드 실패:', error);
    if (error instanceof Error) {
      console.error('에러 상세:', error.message);
    }
    return [];
  }
};
