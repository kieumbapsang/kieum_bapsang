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
import { KakaoMapForStores } from "../components/KakaoMapForStores";
import { Character } from "../components/Character";
import { useState, useMemo } from "react";
import { getRandomTip } from "../utils/randomTips";
import { useUser } from '../contexts/UserContext';

type CityKey = '서울특별시' | '부산광역시' | '대구광역시' | '인천광역시' | '광주광역시' | '대전광역시' | '울산광역시' | '세종특별자치시' | '경기도' | '강원도' | '충청북도' | '충청남도';

interface StoreItem {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  lat: number;
  lng: number;
  city?: CityKey;
  district?: string;
}

const stores: StoreItem[] = [
  {
    id: "1",
    name: "행복한 밥상",
    address: "서울시 강남구 테헤란로 123",
    distance: "0.3km",
    phone: "02-1234-5678",
    lat: 37.5012,
    lng: 127.0396,
    city: "서울특별시",
    district: "강남구",
  },
  {
    id: "2",
    name: "GS25 역삼점",
    address: "서울시 강남구 역삼동 456",
    distance: "0.5km",
    phone: "02-2345-6789",
    lat: 37.5012,
    lng: 127.0396,
    city: "서울특별시",
    district: "강남구",
  },
  {
    id: "3",
    name: "따뜻한 카페",
    address: "서울시 강남구 선릉로 789",
    distance: "0.7km",
    phone: "02-3456-7890",
    lat: 37.5012,
    lng: 127.0396,
    city: "서울특별시",
    district: "강남구",
  },
  {
    id: "4",
    name: "맘스터치 강남점",
    address: "서울시 강남구 강남대로 321",
    distance: "0.9km",
    phone: "02-4567-8901",
    lat: 37.5012,
    lng: 127.0396,
    city: "서울특별시",
    district: "강남구",
  },
  {
    id: "5",
    name: "신선마트",
    address: "서울시 강남구 논현로 654",
    distance: "1.2km",
    phone: "02-5678-9012",
    lat: 37.5012,
    lng: 127.0396,
    city: "서울특별시",
    district: "강남구",
  },
];

const cities: CityKey[] = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도',
  '충청북도', '충청남도'
];

const districtsByCity: Record<CityKey, string[]> = {
  '서울특별시': ['서대문구', '양천구', '구로구', '영등포구', '관악구', '강남구', '마포구', '강서구', '금천구', '동작구', '서초구', '송파구'],
  '부산광역시': ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'],
  '대구광역시': ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'],
  '인천광역시': ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'],
  '광주광역시': ['동구', '서구', '남구', '북구', '광산구'],
  '대전광역시': ['동구', '중구', '서구', '유성구', '대덕구'],
  '울산광역시': ['중구', '남구', '동구', '북구', '울주군'],
  '세종특별자치시': ['세종시'],
  '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '광명시', '김포시', '군포시', '광주시', '이천시', '양주시', '오산시', '구리시', '안성시', '포천시', '의왕시', '하남시', '여주시', '양평군', '동두천시', '과천시', '가평군', '연천군'],
  '강원도': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
  '충청북도': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
  '충청남도': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군']
};

export function StorePage() {
  const { userInfo } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const randomTip = useMemo(() => getRandomTip(), []);

  // 주소에서 초기 지역 파싱
  const parseAddress = (address: string): { city: CityKey | null; district: string | null } => {
    if (!address) return { city: null, district: null };
    const addressPattern = /^(.+?)(시|도|특별시|광역시|특별자치시|특별자치도)\s+(.+?)(구|군|시)$/;
    const match = address.match(addressPattern);
    if (!match) return { city: null, district: null };
    const cityPart = match[1] + match[2];
    const districtPart = match[3] + match[4];
    return {
      city: cityPart as CityKey,
      district: districtPart
    };
  };

  const { city: initialCity, district: initialDistrict } = parseAddress(userInfo.address || '');
  const [selectedCity, setSelectedCity] = useState<CityKey>(initialCity || '서울특별시');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(initialDistrict ? [initialDistrict] : ['강남구']);
  const [tempSelectedCity, setTempSelectedCity] = useState<CityKey>(initialCity || '서울특별시');
  const [tempSelectedDistricts, setTempSelectedDistricts] = useState<string[]>(initialDistrict ? [initialDistrict] : ['강남구']);

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

  // 필터링된 가게 목록
  const filteredStores = stores
    .filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = 
        (!selectedCity || store.city === selectedCity) &&
        (selectedDistricts.length === 0 || (store.district && selectedDistricts.includes(store.district)));
      return matchesSearch && matchesRegion;
    })
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

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
            {selectedDistricts.length + 1}개 선택
          </span>
        </Button>
      </div>

      {/* Kakao Map */}
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl">
        <KakaoMapForStores
          stores={filteredStores.map(store => ({
            id: store.id,
            name: store.name,
            category: "",
            address: store.address,
            lat: store.lat,
            lng: store.lng,
          }))}
          center={{ lat: 37.4979, lng: 127.0276 }}
          onStoreClick={() => {}}
        />
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

        <div className="space-y-4">
          {filteredStores.map((store) => (
            <Card
              key={store.id}
              className="p-5 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-3xl hover:scale-[1.01]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="text-gray-900">{store.name}</h4>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="flex-1">{store.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3 h-3 text-purple-600" />
                    </div>
                    <a 
                      href={`tel:${store.phone}`}
                      className="text-purple-600 hover:underline"
                    >
                      {store.phone}
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
              가맹점에서 <strong>급식카드</strong>를 보여주고 결제하세요
            </span>
          </li>
          <li className="flex items-start gap-2 bg-white/70 p-4 rounded-2xl hover:bg-white/90 transition-all">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-gray-600">
              한 끼 <strong>최대 9,000원</strong>까지 사용할 수 있어요
            </span>
          </li>
          <li className="flex items-start gap-2 bg-white/70 p-4 rounded-2xl hover:bg-white/90 transition-all">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-gray-600">
              영양 균형을 위해 <strong>식당</strong>을 자주 이용해보세요
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
          </div>

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
              disabled={tempSelectedDistricts.length === 0}
              className="flex-1 h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              선택 완료 ({tempSelectedDistricts.length + 1}개)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}