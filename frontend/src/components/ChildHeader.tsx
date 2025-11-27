import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/Button";
import { Calendar } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useUser } from '../contexts/UserContext';
import { CalendarViewModal } from "./CalendarViewModal";

export function ChildHeader() {
  const { userInfo } = useUser();
  const [showCalendar, setShowCalendar] = useState(false);

  /**
   * 사용자 이름 또는 기본값
   * 성을 제외하고 이름만 표시 (예: 신짱구 → 짱구)
   */
  const fullName = userInfo.name || '친구';
  const userName = fullName.length > 1 ? fullName.substring(1) : fullName;

  /**
   * 한국어 조사 결정 (야/이)
   * 받침이 있으면 "이", 없으면 "야"
   */
  const getPostposition = useCallback((name: string): string => {
    if (!name || name.length === 0) return '야';

    const lastChar = name.charCodeAt(name.length - 1);

    // 한글 유니코드 범위 체크: 0xAC00 ~ 0xD7A3
    if (lastChar < 0xAC00 || lastChar > 0xD7A3) {
      // 한글이 아닌 경우 기본값
      return '야';
    }

    // 받침 검사: (charCode - 0xAC00) % 28
    // 0이면 받침 없음, 0이 아니면 받침 있음
    const jongseongIndex = (lastChar - 0xAC00) % 28;
    return jongseongIndex !== 0 ? '이' : '야';
  }, []);

  /**
   * 인사말 텍스트
   */
  const greetingText = useMemo(
    () => `${userName}${getPostposition(userName)}`,
    [userName, getPostposition]
  );

  /**
   * Dicebear 아바타 URL
   * seed에 사용자 이름을 사용하여 일관된 아바타 생성
   */
  const avatarUrl = useMemo(
    () => `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userName)}`,
    [userName]
  );

  /**
   * 아바타 fallback 텍스트 (이름의 첫 글자)
   */
  const avatarFallback = useMemo(
    () => userName.charAt(0) || '😊',
    [userName]
  );


  return (
    <>
      <header className="bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 p-6 text-white rounded-b-[2rem] shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={avatarUrl}
                    alt={`${userName}의 아바타`}
                  />
                  <AvatarFallback className="bg-yellow-300 text-yellow-800">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <p className="text-white/80 text-sm">안녕!</p>
                <h2 className="text-white text-xl">{greetingText}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-white hover:bg-white/20 rounded-full w-12 h-12 hover:scale-105 active:scale-95 transition-transform duration-200"
                onClick={() => setShowCalendar(true)}
              >
                <Calendar className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Fun Daily Challenge */}
          {/* <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30"> */}
            {/* <div className="flex items-center justify-between mb-2"> */}
              {/* <span className="text-white">오늘의 미션</span> */}
              {/* <span className="text-white bg-white/20 px-3 py-1 rounded-full text-sm">3/5</span> */}
            {/* </div> */}
            {/* <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden"> */}
              {/* <div
                className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-3 rounded-full transition-all duration-500 shadow-inner"
                style={{ width: "80%" }}
              /> */}
            {/* </div> */}
            {/* <p className="text-white/90 text-sm mt-2">채소 2가지 더 먹으면 배지를 받을 수 있어요!</p> */}
          {/* </div> */}
        </div>
      </header>

      <CalendarViewModal
        open={showCalendar}
        onOpenChange={setShowCalendar}
      />
    </>
  );
}