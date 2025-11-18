import { Card } from "../components/ui/Card";
import { Character } from "../components/Character";
import { useMemo, useEffect, useState } from "react";
import { getRandomTip } from "../utils/randomTips";
import { useUser } from "../contexts/UserContext";
import { api } from "../api/client";


export function GrowthPage() {
  const randomTip = useMemo(() => getRandomTip(), []);
  const { userInfo } = useUser();
  const [userProfile, setUserProfile] = useState<any>(null);

  // 실제 사용자 프로필 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          console.warn('사용자 ID가 없습니다.');
          return;
        }

        const { data: profile } = await api.user.getProfile(parseInt(userId));
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('사용자 프로필 가져오기 실패:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // BMI 계산에 필요한 데이터 (실제 사용자 데이터 사용)
  const height = parseFloat(userProfile?.height || userInfo.height || '0') || 0;
  const weight = parseFloat(userProfile?.weight || userInfo.weight || '0') || 0;
  const bmi = height > 0 && weight > 0 ? (weight / Math.pow(height / 100, 2)).toFixed(1) : '0.0';
  
  // BMI 상태 판정
  const getBMIStatus = (bmiValue: number) => {
    if (bmiValue <= 0) return { status: "데이터 없음", color: "#9CA3AF", position: 50 };
    if (bmiValue < 18.5) return { status: "저체중", color: "#60A5FA", position: 15 };
    if (bmiValue < 23) return { status: "정상", color: "#34D399", position: 45 };
    if (bmiValue < 25) return { status: "과체중", color: "#FBBF24", position: 75 };
    return { status: "비만", color: "#F87171", position: 90 };
  };

  // 평균 체중 계산 (간단한 예시)
  const averageWeight = height > 0 ? Math.round((height - 100) * 0.9) : 0;

  const bmiStatus = getBMIStatus(Number(bmi));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center mb-4">
        <h1 className="text-gray-900 mb-2">성장 기록</h1>
        <p className="text-gray-600">나의 건강 상태를 확인해봐요!</p>
      </div>

      {/* BMI 분석 카드 */}
      <Card className="p-8 border-0 shadow-xl bg-white rounded-3xl">
        <h2 className="text-gray-900 mb-8 text-2xl">BMI 분석</h2>

        {/* BMI 결과 */}
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-3">
            신체질량지수(BMI)는{" "}
            <span className="text-4xl mx-2" style={{ color: bmiStatus.color }}>
              {bmi}
            </span>
            로{" "}
            <span className="text-2xl" style={{ color: bmiStatus.color }}>
              '{bmiStatus.status}'
            </span>{" "}
            입니다.
          </p>
          <p className="text-gray-600 text-lg">
            평균체중은{" "}
            <span className="text-2xl mx-1">{averageWeight} kg</span> 입니다.
          </p>
        </div>

        {/* BMI 그라데이션 바 */}
        <div className="mb-8">
          <div className="relative h-16 rounded-full overflow-hidden shadow-lg mb-4">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, #60A5FA 0%, #34D399 25%, #34D399 50%, #FBBF24 75%, #F87171 100%)",
              }}
            ></div>
            {/* BMI 인디케이터 */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
              style={{ left: `${bmiStatus.position}%` }}
            >
              <div className="relative -translate-x-1/2">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[16px] border-l-transparent border-r-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>

          {/* BMI 범위 라벨 */}
          <div className="flex justify-between text-sm px-1">
            <div className="text-center" style={{ width: "25%" }}>
              <p className="text-blue-400">저체중</p>
            </div>
            <div className="text-center" style={{ width: "25%" }}>
              <p className="text-emerald-400">정상</p>
            </div>
            <div className="text-center" style={{ width: "25%" }}>
              <p className="text-yellow-400">과체중</p>
            </div>
            <div className="text-center" style={{ width: "25%" }}>
              <p className="text-red-400">비만</p>
            </div>
          </div>

          {/* BMI 수치 */}
          <div className="flex justify-between text-xs text-gray-500 px-1 mt-2">
            <span>0</span>
            <span>18.5</span>
            <span>23</span>
            <span>25</span>
            <span>30+</span>
          </div>
        </div>

        {/* 키와 체중 표시 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl">
            <p className="text-5xl text-gray-900 mb-2">{height > 0 ? `${height} cm` : '-'}</p>
            <p className="text-gray-600">키</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl">
            <p className="text-5xl text-gray-900 mb-2">{weight > 0 ? `${weight} kg` : '-'}</p>
            <p className="text-gray-600">체중</p>
          </div>
        </div>
      </Card>

      {/* Welcome Character */}
      <Character 
        name="carrot"
        message={randomTip}
      />

      {/* 건강하게 자라는 팁 */}
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl">
        <h3 className="text-gray-900 mb-5">건강하게 자라는 팁</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl hover:bg-white/90 transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm shadow-md">
              1
            </div>
            <div>
              <h4 className="text-gray-900 mb-1">균형 잡힌 식사</h4>
              <p className="text-sm text-gray-600">
                고기, 채소, 과일을 골고루 먹어보자!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl hover:bg-white/90 transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm shadow-md">
              2
            </div>
            <div>
              <h4 className="text-gray-900 mb-1">충분한 수면</h4>
              <p className="text-sm text-gray-600">
                매일 9-10시간 푹 자보자! 자는 동안 쑥쑥 자란다구~
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl hover:bg-white/90 transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm shadow-md">
              3
            </div>
            <div>
              <h4 className="text-gray-900 mb-1">신나게 운동</h4>
              <p className="text-sm text-gray-600">
                줄넘기, 농구 같은 운동을 자주 해보자!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/70 p-4 rounded-2xl hover:bg-white/90 transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm shadow-md">
              4
            </div>
            <div>
              <h4 className="text-gray-900 mb-1">물 많이 마시기</h4>
              <p className="text-sm text-gray-600">
                하루에 물 6-8컵 마시면 건강해진다!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

