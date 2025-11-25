import { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";

interface Store {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
}

interface KakaoMapForStoresProps {
  stores: Store[];
  center?: { lat: number; lng: number };
  onStoreClick?: (storeId: string) => void;
}

// Kakao Maps API 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

export function KakaoMapForStores({ stores, center, onStoreClick }: KakaoMapForStoresProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 지도 초기화 및 마커 추가 함수
  const initializeMap = () => {
    console.log('지도 초기화 함수 호출');
    console.log('mapContainer.current:', !!mapContainer.current);
    console.log('window.kakao:', !!window.kakao);
    console.log('window.kakao.maps:', !!(window.kakao && window.kakao.maps));
    
    if (!mapContainer.current) {
      console.error('mapContainer가 없습니다');
      setError("지도 컨테이너를 찾을 수 없습니다.");
      return;
    }
    
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 SDK가 로드되지 않았습니다');
      setError("카카오맵 SDK가 로드되지 않았습니다.");
      return;
    }

    try {
      console.log('지도 생성 시작');
      const centerPosition = center || { lat: 37.4979, lng: 127.0276 };

      // 지도 생성
      const mapOption = {
        center: new window.kakao.maps.LatLng(
          centerPosition.lat,
          centerPosition.lng
        ),
        level: 4,
      };

      const map = new window.kakao.maps.Map(
        mapContainer.current,
        mapOption
      );

      // 마커 생성
      stores.forEach((store) => {
        const markerPosition = new window.kakao.maps.LatLng(
          store.lat,
          store.lng
        );

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          map: map,
        });

        // 인포윈도우 생성
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:10px;font-size:12px;min-width:150px;">
            <strong>${store.name}</strong><br/>
            <span style="color:#666;">${store.category}</span>
          </div>`,
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
          if (onStoreClick) {
            onStoreClick(store.id);
          }
        });

        // 마우스 오버 시 인포윈도우 표시
        window.kakao.maps.event.addListener(marker, "mouseover", () => {
          infowindow.open(map, marker);
        });

        window.kakao.maps.event.addListener(marker, "mouseout", () => {
          infowindow.close();
        });
      });

      // 현재 위치 마커 (빨간색)
      const currentMarker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(
          centerPosition.lat,
          centerPosition.lng
        ),
        map: map,
        image: new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
          new window.kakao.maps.Size(64, 69),
          { offset: new window.kakao.maps.Point(27, 69) }
        ),
      });

      // 지도 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(
        zoomControl,
        window.kakao.maps.ControlPosition.RIGHT
      );

      setIsMapLoaded(true);
    } catch (err) {
      setError("지도를 불러오는데 실패했습니다.");
      console.error("Map loading error:", err);
    }
  };

  useEffect(() => {
    console.log('카카오맵 초기화 시작');
    console.log('window.kakao 상태:', !!window.kakao);
    console.log('window.kakao.maps 상태:', !!(window.kakao && window.kakao.maps));
    
    // 이미 로드되어 있고 maps가 있으면 바로 초기화
    if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
      console.log('카카오맵 SDK 이미 로드됨, 바로 초기화');
      window.kakao.maps.load(() => {
        initializeMap();
      });
      return;
    }

    // 이미 스크립트가 추가되어 있는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
    if (existingScript) {
      console.log('카카오맵 스크립트 이미 존재, 로드 대기 중...');
      let retryCount = 0;
      const maxRetries = 50; // 5초 대기
      
      const checkKakaoLoaded = () => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
          console.log('카카오맵 SDK 로드 완료, 초기화 시작');
          window.kakao.maps.load(() => {
            initializeMap();
          });
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkKakaoLoaded, 100);
        } else {
          console.error('카카오맵 SDK 로드 타임아웃');
          setError("카카오맵 SDK 로드 시간이 초과되었습니다. 네트워크를 확인해주세요.");
        }
      };
      checkKakaoLoaded();
      return;
    }

    // 카카오맵 API 키 (환경 변수에서 가져오기)
    const KAKAO_MAP_API_KEY = process.env.REACT_APP_KAKAO_MAP_API_KEY || '';
    
    // 프로토콜 명시 (HTTP/HTTPS 자동 감지)
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const scriptUrl = `${protocol}//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`;
    
    console.log('카카오맵 스크립트 로드 시작:', scriptUrl);
    
    // 카카오맵 API 스크립트 로드
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('카카오맵 스크립트 로드 완료');
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => {
          console.log('카카오맵 maps.load 완료, 초기화 시작');
          initializeMap();
        });
      } else {
        console.error('window.kakao.maps가 없습니다');
        setError("카카오맵 SDK가 제대로 로드되지 않았습니다.");
      }
    };

    script.onerror = (err) => {
      console.error('카카오맵 스크립트 로드 실패:', err);
      setError("카카오맵 API를 불러올 수 없습니다. API 키와 네트워크를 확인해주세요.");
    };

    document.head.appendChild(script);

    return () => {
      // 클린업
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [stores, center, onStoreClick]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="aspect-video bg-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
        <div className="text-center p-6">
          <p className="text-gray-600 mb-2">⚠️ {error}</p>
          <p className="text-sm text-gray-500">
            카카오 개발자 센터에서 API 키를 발급받아주세요
          </p>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-white text-gray-900 shadow-lg">
            근처 가맹점 {stores.length}개
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="aspect-video rounded-xl overflow-hidden"
        style={{ width: "100%", height: "400px" }}
      />
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-200 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">지도 로딩중...</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <Badge className="bg-white text-gray-900 shadow-lg">
          근처 가맹점 {stores.length}개
        </Badge>
      </div>
    </div>
  );
}


