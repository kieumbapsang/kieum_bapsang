import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

export interface Store {
  id: number;
  name: string;
  address: string;
  tel?: string;
  lat: number;
  lng: number;
  district: string;
  dong: string;
}

const isValidTel = (tel: string | undefined): boolean => {
  if (!tel) return false;
  const cleaned = tel.trim().replace(/[-\s]/g, '');
  return cleaned !== '0000000000' && !/^0{3}[- ]?0{4}[- ]?0{4}$/.test(tel.trim());
};

type KakaoMapProps = {
  city: string;
  districts: string[];
  stores: Store[];
  onStoreClick?: (store: Store) => void;
  selectedStoreId?: number | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchResults?: Store[];
};

export const KakaoMap: React.FC<KakaoMapProps> = ({ city, districts, stores, onStoreClick, selectedStoreId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: number]: { marker: any; infowindow: any; position: any } }>({});
  const currentInfowindowRef = useRef<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = React.useState(false);

  // 선택된 매장이 변경되면 지도 이동
  useEffect(() => {
    if (selectedStoreId === null || selectedStoreId === undefined) {
      return;
    }

    // stores 배열에서 해당 매장 찾기
    const selectedStore = stores.find(s => s.id === selectedStoreId);

    if (!selectedStore) {
      return;
    }

    if (!kakaoMapRef.current || !window.kakao) {
      return;
    }

    // 약간의 딜레이 후 지도 이동 (DOM 업데이트 대기)
    setTimeout(() => {
      if (!kakaoMapRef.current) return;

      // 매장 좌표로 지도 이동
      const position = new window.kakao.maps.LatLng(selectedStore.lat, selectedStore.lng);

      // setCenter로 즉시 이동
      kakaoMapRef.current.setCenter(position);

      // 줌 레벨 설정 (레벨 3 = 약 50m 반경)
      kakaoMapRef.current.setLevel(3);

      // 마커가 있으면 인포윈도우 열기
      const markerData = markersRef.current[selectedStoreId];

      if (markerData) {
        // 이전 인포윈도우 닫기
        if (currentInfowindowRef.current) {
          currentInfowindowRef.current.close();
        }

        // 해당 매장의 인포윈도우 열기
        markerData.infowindow.open(kakaoMapRef.current, markerData.marker);
        currentInfowindowRef.current = markerData.infowindow;
      }
    }, 100);
  }, [selectedStoreId, stores]);

  // 카카오맵 SDK 동적 로드
  useEffect(() => {
    // 이미 로드되어 있으면 스킵
    if (window.kakao && window.kakao.maps) {
      setIsKakaoLoaded(true);
      console.log('카카오맵 SDK 이미 로드됨');
      return;
    }

    // 이미 스크립트가 추가되어 있는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
    if (existingScript) {
      const checkKakaoLoaded = () => {
        if (window.kakao && window.kakao.maps) {
          setIsKakaoLoaded(true);
          console.log('카카오맵 SDK 로드 완료');
        } else {
          setTimeout(checkKakaoLoaded, 100);
        }
      };
      checkKakaoLoaded();
      return;
    }

    // 카카오맵 API 키 (환경 변수에서 가져오기)
    const KAKAO_MAP_API_KEY = process.env.REACT_APP_KAKAO_MAP_API_KEY || 'c44dac15778d3b96e883cc105172b982';
    
    // 스크립트 동적 로드
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      // 스크립트 로드 후 kakao.maps.load() 호출
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsKakaoLoaded(true);
          console.log('카카오맵 SDK 로드 완료');
        });
      }
    };
    
    script.onerror = () => {
      setError('카카오맵 SDK 로드 실패');
      console.error('카카오맵 SDK 로드 실패');
    };
    
    document.head.appendChild(script);
    
    // cleanup 함수
    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거하지 않음 (다른 컴포넌트에서도 사용 가능)
    };
  }, []);

  // 시도별 중심 좌표
  const getCityCoordinates = (city: string): { lat: number; lng: number } => {
    const coordinates: Record<string, { lat: number; lng: number }> = {
      '서울특별시': { lat: 37.5665, lng: 126.9780 },
      '부산광역시': { lat: 35.1796, lng: 129.0756 },
      '대구광역시': { lat: 35.8714, lng: 128.6014 },
      '인천광역시': { lat: 37.4563, lng: 126.7052 },
      '광주광역시': { lat: 35.1595, lng: 126.8526 },
      '대전광역시': { lat: 36.3504, lng: 127.3845 },
      '울산광역시': { lat: 35.5384, lng: 129.3114 },
      '세종특별자치시': { lat: 36.4800, lng: 127.2890 },
      '경기도': { lat: 37.4138, lng: 127.5183 },
      '강원특별자치도': { lat: 37.8228, lng: 128.1555 },
      '충청북도': { lat: 36.6357, lng: 127.4917 },
      '충청남도': { lat: 36.5184, lng: 126.8000 },
      '경상남도': { lat: 35.4606, lng: 128.2132 },
      '경상북도': { lat: 36.4919, lng: 128.8889 },
      '전북특별자치도': { lat: 35.7175, lng: 127.1530 }
    };

    return coordinates[city] || coordinates['서울특별시'];
  };

  // 카카오맵 초기화
  useEffect(() => {
    if (!isKakaoLoaded) {
      console.log('카카오맵 SDK가 아직 로드되지 않았습니다');
      return;
    }

    if (!mapRef.current) {
      console.log('mapRef가 없습니다');
      return;
    }

    // 이미 지도가 생성되어 있으면 재생성하지 않음
    if (kakaoMapRef.current) {
      console.log('지도가 이미 생성되어 있습니다');
      return;
    }

    try {
      const cityCoord = getCityCoordinates(city);
      const options = {
        center: new window.kakao.maps.LatLng(cityCoord.lat, cityCoord.lng),
        level: 3  // 레벨 3 = 약 50m 반경
      };

      const map = new window.kakao.maps.Map(mapRef.current, options);
      kakaoMapRef.current = map;
      setError(null);
      console.log('카카오맵이 성공적으로 초기화되었습니다');
    } catch (error: any) {
      const errorMsg = `카카오맵 초기화 실패: ${error.message}`;
      console.error(errorMsg, error);
      setError(errorMsg);
    }
  }, [city, isKakaoLoaded]);

  // 매장 마커 업데이트
  useEffect(() => {
    if (!kakaoMapRef.current || !window.kakao) return;

    // 이전에 열려있던 인포윈도우 닫기
    if (currentInfowindowRef.current) {
      currentInfowindowRef.current.close();
      currentInfowindowRef.current = null;
    }

    // 기존 마커 제거
    Object.values(markersRef.current).forEach(item => {
      item.marker.setMap(null);
    });
    markersRef.current = {};

    // 유효한 매장만 필터링
    const validStores = stores.filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng));

    if (validStores.length === 0) {
      // 매장이 없으면 선택된 시도 중심으로 이동
      const cityCoord = getCityCoordinates(city);
      const moveLatLon = new window.kakao.maps.LatLng(cityCoord.lat, cityCoord.lng);
      kakaoMapRef.current.setCenter(moveLatLon);
      return;
    }

    // 새로운 마커 추가
    validStores.forEach((store) => {
      const position = new window.kakao.maps.LatLng(store.lat, store.lng);

      const marker = new window.kakao.maps.Marker({
        position: position,
        map: kakaoMapRef.current
      });

      // 인포윈도우 (팝업)
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="
            padding: 15px 18px;
            min-width: 240px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">
            <div style="
              font-size: 16px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 8px;
              line-height: 1.4;
            ">${store.name}</div>
            <div style="
              font-size: 13px;
              color: #666;
              line-height: 1.5;
              margin-bottom: 4px;
            ">${store.address}</div>
            ${isValidTel(store.tel) ? `
              <div style="
                font-size: 13px;
                color: #10b981;
                font-weight: 500;
                margin-top: 6px;
              ">📞 ${store.tel}</div>
            ` : ''}
          </div>
        `
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 이전에 열려있던 인포윈도우 닫기
        if (currentInfowindowRef.current) {
          currentInfowindowRef.current.close();
        }
        // 새로운 인포윈도우 열기
        infowindow.open(kakaoMapRef.current, marker);
        // 현재 인포윈도우 참조 저장
        currentInfowindowRef.current = infowindow;

        // 부모 컴포넌트의 onStoreClick 호출
        if (onStoreClick) {
          onStoreClick(store);
        }
      });

      // storeId를 키로 마커와 인포윈도우 저장
      markersRef.current[store.id] = { marker, infowindow, position };
    });

    // 첫 번째 매장으로 지도 중심 이동
    if (validStores.length > 0) {
      const firstStore = validStores[0];
      const moveLatLon = new window.kakao.maps.LatLng(firstStore.lat, firstStore.lng);
      kakaoMapRef.current.setCenter(moveLatLon);
    }
  }, [stores, city, onStoreClick]);

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '10px' }}>카카오맵 로드 실패</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>{error}</p>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '10px' }}>
            public/index.html 파일의 카카오맵 API 키를 확인해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (!isKakaoLoaded) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ margin: '0 auto', width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '10px' }}>카카오맵 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 줌 인 (확대)
  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (kakaoMapRef.current) {
      const currentLevel = kakaoMapRef.current.getLevel();
      const currentCenter = kakaoMapRef.current.getCenter();
      console.log('확대 전 - Level:', currentLevel, 'Center:', currentCenter.getLat(), currentCenter.getLng());
      kakaoMapRef.current.setLevel(currentLevel - 1);
      console.log('확대 후 - Level:', kakaoMapRef.current.getLevel());
    }
  };

  // 줌 아웃 (축소)
  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (kakaoMapRef.current) {
      const currentLevel = kakaoMapRef.current.getLevel();
      const currentCenter = kakaoMapRef.current.getCenter();
      console.log('축소 전 - Level:', currentLevel, 'Center:', currentCenter.getLat(), currentCenter.getLng());
      kakaoMapRef.current.setLevel(currentLevel + 1);
      console.log('축소 후 - Level:', kakaoMapRef.current.getLevel());
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>

      {/* 확대/축소 컨트롤 버튼 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        zIndex: 1000
      }}>
        <button
          type="button"
          onClick={handleZoomIn}
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="확대"
        >
          +
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="축소"
        >
          −
        </button>
      </div>
    </div>
  );
};