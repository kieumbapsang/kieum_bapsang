import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Search,
  MapPin,
  Phone,
  Filter,
} from "lucide-react";
import { KakaoMap, Store } from '../components/ui/kakaoMap';
import { Character } from "../components/Character";
import { useState, useMemo, useEffect } from "react";
import { getRandomTip } from "../utils/randomTips";
import { useUser } from '../contexts/UserContext';
import { getStoresByDistrict, getAllStores, getStoresByCity } from '../services/storeService';
import { api } from '../api/client';

type CityKey = '서울특별시' | '부산광역시' | '대구광역시' | '인천광역시' | '광주광역시' | '대전광역시' | '울산광역시' | '세종특별자치시' | '경기도' | '강원특별자치도' | '충청북도' | '충청남도' | '경상남도' | '경상북도' | '전북특별자치도';

// 편의점 확인
const isConvenienceStore = (storeName: string): boolean => {
  const name = storeName.toLowerCase();
  return name.includes('cu') || 
         name.includes('씨유') || 
         name.includes('세븐일레븐') ||
         name.includes('gs25') ||
         name.includes('지에스25') ||
         name.includes('이마트24');
};

const isValidTel = (tel: string | undefined): boolean => {
  if (!tel) return false;
  const cleaned = tel.trim().replace(/[-\s]/g, '');
  return cleaned !== '0000000000' && !/^0{3}[- ]?0{4}[- ]?0{4}$/.test(tel.trim());
};

const cities: CityKey[] = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도',
  '충청북도', '충청남도', '경상남도', '경상북도', '전북특별자치도'
];

const districtsByCity: Record<CityKey, string[]> = {
  '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '부산광역시': ['강서구', '동래구', '북구', '서구', '연제구', '해운대구'],
  '대구광역시': ['남구', '달서구', '북구', '수성구', '중구'],
  '인천광역시': ['남동구', '미추홀구', '연수구'],
  '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
  '대전광역시': ['서구', '유성구'],
  '울산광역시': ['울주군', '중구'],
  '세종특별자치시': ['없음'],
  '경기도': ['과천시', '광명시', '구리시', '군포시', '동두천시', '부천시', '수원시', '안산시 단원구', '안산시 상록구', '양주시', '여주시', '연천군', '용인시', '의왕시', '의정부시', '파주시', '평택시', '하남시'],
  '강원특별자치도': ['삼척시', '속초시', '영월군', '원주시', '춘천시', '화천군'],
  '충청북도': ['단양군', '증평군'],
  '충청남도': ['금산군', '논산시', '부여군', '서산시', '천안시 동남구', '천안시 서북구', '청양군', '태안군', '홍성군'],
  '경상남도': ['김해시', '밀양시', '사천시', '창원시', '통영시', '함양군'],
  '경상북도': ['경산시', '경주시', '구미시', '김천시', '문경시', '상주시', '영주시', '영천시', '울진군', '청도군', '포항시'],
  '전북특별자치도': ['남원시', '전주시 덕진구', '전주시 완산구', '정읍시']
};

export function StorePage() {
  const { userInfo } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const randomTip = useMemo(() => getRandomTip(), []);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isAddressLoaded, setIsAddressLoaded] = useState<boolean>(false);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  // 서버에서 사용자 프로필 가져오기 (최신 주소 정보)
  useEffect(() => {
    const fetchUserAddress = async () => {
      setIsAddressLoaded(false);
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          console.log('user_id가 없어서 UserContext의 주소 사용');
          const address = userInfo?.address || '';
          setUserAddress(address);
          setIsAddressLoaded(true);
          return;
        }

        const { data: profileData, error } = await api.user.getProfile(parseInt(userId));
        
        if (error) {
          console.error('사용자 프로필 로딩 오류:', error);
          console.log('UserContext의 주소 사용');
          const address = userInfo?.address || '';
          setUserAddress(address);
          setIsAddressLoaded(true);
          return;
        }

        if (profileData?.address) {
          console.log('서버에서 가져온 사용자 주소:', profileData.address);
          setUserAddress(profileData.address);
        } else {
          console.log('서버에서 주소를 찾을 수 없어서 UserContext의 주소 사용');
          const address = userInfo?.address || '';
          setUserAddress(address);
        }
        setIsAddressLoaded(true);
      } catch (err) {
        console.error('사용자 프로필 로딩 오류:', err);
        console.log('UserContext의 주소 사용');
        const address = userInfo?.address || '';
        setUserAddress(address);
        setIsAddressLoaded(true);
      }
    };

    fetchUserAddress();
  }, [userInfo?.address]);

  // 주소에서 초기 지역 파싱 (기본모드와 동일한 로직)
  const parseAddress = (address: string): { city: CityKey | null; district: string | null } => {
    if (!address) {
      console.log('주소가 비어있습니다.');
      return { city: null, district: null };
    }

    // 주소 정규화 - 공백 정리 및 앞뒤 공백 제거
    let normalized = address.trim().replace(/\s+/g, ' ');
    console.log('주소 파싱 시작:', normalized);

    // 약칭을 전체 이름으로 변환
    const cityMapping: Record<string, CityKey> = {
      '서울시': '서울특별시',
      '서울': '서울특별시',
      '부산시': '부산광역시',
      '부산': '부산광역시',
      '대구시': '대구광역시',
      '대구': '대구광역시',
      '인천시': '인천광역시',
      '인천': '인천광역시',
      '광주시': '광주광역시',
      '광주': '광주광역시',
      '대전시': '대전광역시',
      '대전': '대전광역시',
      '울산시': '울산광역시',
      '울산': '울산광역시',
      '세종시': '세종특별자치시',
      '세종': '세종특별자치시',
      '경기': '경기도',
      '강원': '강원특별자치도',
      '충북': '충청북도',
      '충남': '충청남도',
      '경남': '경상남도',
      '경북': '경상북도',
      '전북': '전북특별자치도'
    };

    // 정규식으로 파싱 (완전한 형태) - 시도명과 구/군/시 모두 포함
    // 예: "서울특별시 관악구", "서울특별시 마포구", "경기도 수원시" 등
    const addressPattern = /^(.+?)(특별시|광역시|특별자치시|특별자치도|도)\s+(.+?)(구|군|시)/;
    const match = normalized.match(addressPattern);

    if (match) {
      const cityPart = match[1] + match[2];
      const districtPart = match[3] + match[4];
      
      console.log('정규식 매칭 성공:', { cityPart, districtPart });
      
      // 시도명이 유효한 CityKey인지 확인
      if (cities.includes(cityPart as CityKey)) {
        console.log('파싱 성공:', { city: cityPart, district: districtPart });
        return {
          city: cityPart as CityKey,
          district: districtPart
        };
      } else {
        console.log('유효하지 않은 시도명:', cityPart);
      }
    } else {
      console.log('정규식 매칭 실패, 약칭 매핑 시도');
    }    

    // 시도명 약칭 매칭 - "서울시 서대문구" 같은 형식 처리
    // 긴 약칭부터 매칭 (예: "서울시" -> "서울"보다 먼저)
    const sortedMappingEntries = Object.entries(cityMapping).sort((a, b) => b[0].length - a[0].length);
    
    for (const [short, full] of sortedMappingEntries) {
      if (normalized.startsWith(short)) {
        const rest = normalized.substring(short.length).trim();
        console.log(`약칭 "${short}" 매칭됨, 나머지: "${rest}"`);

        // 구/군/시 패턴 찾기 (공백 제거 후 매칭)
        const trimmedRest = rest.replace(/\s+/g, ' ').trim();
        const districtMatch = trimmedRest.match(/(.+?)(구|군|시)/);
        if (districtMatch) {
          const district = (districtMatch[1] + districtMatch[2]).trim();
          console.log('약칭 매핑으로 파싱 성공:', { city: full, district, original: normalized });
          return {
            city: full,
            district: district
          };
        }
        
        // 구/군/시를 찾지 못했지만 시도는 찾은 경우
        console.log(`시도 "${full}"는 매칭되었지만 구/군/시를 찾을 수 없음: "${rest}"`);
        return {
          city: full,
          district: null
        };
      }
    }
    
    console.log('주소 파싱 실패:', normalized);
    return { city: null, district: null };
  };

  const addressToParse = userAddress || userInfo?.address || '';
  const { city: initialCity, district: initialDistrict } = parseAddress(addressToParse);
  const [selectedCity, setSelectedCity] = useState<CityKey | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [tempSelectedCity, setTempSelectedCity] = useState<CityKey>(initialCity || '서울특별시');
  const [tempSelectedDistricts, setTempSelectedDistricts] = useState<string[]>(initialDistrict ? [initialDistrict] : []);

  // 주소가 로드되고 파싱되면 선택된 지역 설정
  useEffect(() => {
    if (isAddressLoaded && addressToParse) {
      const { city: parsedCity, district: parsedDistrict } = parseAddress(addressToParse);
      if (parsedCity) {
        setSelectedCity(parsedCity);
        // 거주지의 시도와 시군구를 기본값으로 설정
        if (parsedDistrict) {
          setSelectedDistricts([parsedDistrict]);
        } else {
          setSelectedDistricts([]);
        }
      } else {
        setSelectedCity('서울특별시');
        setSelectedDistricts([]);
      }
    } else if (isAddressLoaded && !addressToParse) {
      setSelectedCity('서울특별시');
      setSelectedDistricts([]);
    }
  }, [isAddressLoaded, addressToParse]);

  const currentDistricts = districtsByCity[tempSelectedCity] || [];

  const handleTempCityChange = (city: CityKey) => {
    setTempSelectedCity(city);
    setTempSelectedDistricts([]);
  };

  const handleTempDistrictChange = (district: string) => {
    setTempSelectedDistricts(prev =>
      prev.includes(district)
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const handleConfirmRegion = () => {
    setSelectedCity(tempSelectedCity);
    setSelectedDistricts([...tempSelectedDistricts]);
    setIsRegionModalOpen(false);
  };

  // 선택된 지역에 따라 매장 데이터 로드
  useEffect(() => {
    if (!isAddressLoaded || !selectedCity) {
      return;
    }

    const loadStores = async () => {
      setLoading(true);
      try {
        // 사용자 거주지 시도와 선택된 시도 비교
        const isUserCity = initialCity === selectedCity;
        
        console.log('매장 데이터 로드 시작:', {
          initialCity,
          selectedCity,
          isUserCity,
          selectedDistricts,
          districtsLength: selectedDistricts.length
        });

        let stores: Store[] = [];

        if (isUserCity) {
          // 거주지 시도와 일치하면 해당 시도의 모든 가맹점 조회 (시군구 선택 여부와 무관)
          console.log('거주지 시도와 일치 - 모든 가맹점 조회');
          if (selectedDistricts.length > 0) {
            // 특정 시군구가 선택된 경우: 해당 시군구의 가맹점만 조회
            console.log('시군구 선택됨 - 해당 시군구의 가맹점 조회');
            stores = await getStoresByDistrict(selectedCity, selectedDistricts);
          } else {
            // 시군구가 선택되지 않은 경우: 해당 시도의 모든 가맹점 조회
            console.log('시군구 미선택 - 해당 시도의 모든 가맹점 조회');
            stores = await getStoresByCity(selectedCity);
          }
        } else {
          // 거주지 시도와 일치하지 않으면 편의점만 조회
          console.log('거주지 시도와 다름 - 편의점만 조회');
          if (selectedDistricts.length > 0) {
            // 시군구가 선택된 경우: 해당 시군구의 편의점만 조회
            const districtStores = await getStoresByDistrict(selectedCity, selectedDistricts);
            stores = districtStores.filter(store => isConvenienceStore(store.name));
            console.log('시군구 편의점 필터링 완료:', {
              totalStores: districtStores.length,
              convenienceStores: stores.length
            });
          } else {
            // 시군구가 선택되지 않은 경우: 해당 시도의 편의점만 조회
            const cityStores = await getStoresByCity(selectedCity);
            stores = cityStores.filter(store => isConvenienceStore(store.name));
            console.log('시도 편의점 필터링 완료:', {
              totalStores: cityStores.length,
              convenienceStores: stores.length
            });
          }
        }

        console.log('매장 데이터 로드 완료:', {
          city: selectedCity,
          districts: selectedDistricts,
          storeCount: stores.length,
          firstStore: stores[0] ? { name: stores[0].name, district: stores[0].district } : null
        });
        setAllStores(stores);
      } catch (error) {
        console.error('매장 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    // 항상 매장 데이터 로드
    loadStores();
  }, [isAddressLoaded, selectedCity, selectedDistricts, initialCity]);

  // 검색어에 따라 필터링된 가게 목록
  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) {
      return allStores;
    }

    return allStores.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.dong && store.dong.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allStores, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center mb-4">
        <h1 className="text-gray-900 mb-2">가맹점 찾기</h1>
        <p className="text-gray-600">급식카드를 쓸 수 있는 곳을 찾아봐요</p>
      </div>

      {/* Search Bar and Region Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="가맹점 이름이나 주소를 검색하세요"
            className="pl-12 h-14 border-0 shadow-lg rounded-2xl bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Region Filter Button */}
        <Button
          variant="outline"
          onClick={() => setIsRegionModalOpen(true)}
          className="w-full h-12 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 rounded-2xl shadow-md transition-all duration-200"
        >
          <Filter className="w-4 h-4 mr-2" />
          <span className="flex-1 text-left">
            {selectedCity}{selectedDistricts.length > 0 && ` · ${selectedDistricts.join(', ')}`}
          </span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {selectedDistricts.length > 0 ? selectedDistricts.length + 1 : 1}개 선택
          </span>
        </Button>
      </div>

      {/* Kakao Map */}
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl">
        {selectedCity && (
          <div className="h-64 relative bg-gray-100 rounded-lg overflow-hidden">
            <KakaoMap
              city={selectedCity}
              districts={selectedDistricts}
              stores={filteredStores}
              onStoreClick={(store) => {
                setSelectedStoreId(store.id);
              }}
              selectedStoreId={selectedStoreId}
            />
          </div>
        )}
        <div className="mt-4 bg-white/60 backdrop-blur-sm p-3 rounded-2xl text-center">
          <p className="text-sm text-gray-600">
            지도를 터치하면 자세한 위치를 볼 수 있어요
          </p>
        </div>
      </Card>

      {/* Store List */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <h3 className="text-gray-900">가까운 가맹점</h3>
          <span className="text-sm text-gray-500">({filteredStores.length}개)</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2">매장 정보를 불러오는 중...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {initialCity === selectedCity 
              ? `선택한 지역(${selectedCity} ${selectedDistricts.join(', ')})에 매장이 없습니다.`
              : `선택한 지역(${selectedCity} ${selectedDistricts.join(', ')})에 편의점이 없습니다.`
            }
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStores.map((store) => (
              <Card
                key={store.id}
                className="p-5 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-3xl hover:scale-[1.01] cursor-pointer"
                onClick={() => {
                  setSelectedStoreId(store.id);
                  // 지도가 있는 위치로 스크롤
                  const mapElement = document.querySelector('.h-64');
                  if (mapElement) {
                    mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="text-gray-900">{store.name}</h4>
                    {store.district && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {store.district}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="flex-1">{store.address}</span>
                    </div>
                    
                    {isValidTel(store.tel) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Phone className="w-3 h-3 text-purple-600" />
                        </div>
                        <a 
                          href={`tel:${store.tel}`}
                          className="text-purple-600 hover:underline"
                        >
                          {store.tel}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Welcome Character */}
      <Character 
        name="bear"
        message={randomTip}
      />

      {/* Tips */}
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl">
        <h3 className="text-gray-900 mb-4">💡 가맹점 이용 팁</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2 bg-white/70 p-4 rounded-2xl hover:bg-white/90 transition-all">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-gray-600">
              가맹점 <strong>스티커</strong>를 찾아보세요!
            </span>
          </li>
          <li className="flex items-start gap-2 bg-white/70 p-4 rounded-2xl hover:bg-white/90 transition-all">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-gray-600">
              카드를 <strong>소중히</strong> 간직하세요!
            </span>
          </li>
          <li className="flex items-start gap-2 bg-white/70 p-4 rounded-2xl hover:bg-white/90 transition-all">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-gray-600">
              <strong>건강한 음식</strong>을 골라보세요!
            </span>
          </li>
        </ul>
      </Card>

      {/* Region Selection Modal */}
      <Dialog open={isRegionModalOpen} onOpenChange={setIsRegionModalOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              지역 선택
            </DialogTitle>
            <DialogDescription className="sr-only">
              시/도를 선택하고 구/군을 선택할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 시도별 선택 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">시·도 선택</h3>
              <div className="grid grid-cols-2 gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleTempCityChange(city)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      tempSelectedCity === city
                        ? 'bg-green-500 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:transform hover:scale-[1.02]'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* 구별 선택 */}
            {currentDistricts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {tempSelectedCity} 구·군 선택
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {currentDistricts.map((district) => (
                    <button
                      key={district}
                      onClick={() => handleTempDistrictChange(district)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        tempSelectedDistricts.includes(district)
                          ? 'bg-blue-500 text-white shadow-md transform scale-105'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:transform hover:scale-[1.02] border border-gray-200'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        {district}
                        {tempSelectedDistricts.includes(district) && (
                          <span className="text-xs">✓</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 선택된 지역 표시 */}
            {tempSelectedDistricts.length > 0 && (
              <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
                <p className="text-xs text-gray-600 mb-2">선택한 지역</p>
                <p className="text-sm font-semibold text-green-700">
                  {tempSelectedCity} · {tempSelectedDistricts.join(', ')}
                </p>
              </div>
            )}

            {/* 안내 문구 - 거주지 외 지역 선택 시 */}
            {initialCity && initialCity !== tempSelectedCity && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 거주지 외 지역에서는 편의점 목록만 표시됩니다.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsRegionModalOpen(false)}
                className="flex-1 h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmRegion}
                className="flex-1 h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white"
              >
                선택 완료 ({tempSelectedDistricts.length > 0 ? tempSelectedDistricts.length + 1 : 1}개)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}