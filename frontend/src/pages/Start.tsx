import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const StartPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 메인 섹션 */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-32 h-32 mb-8">
          <img src="/favicon.ico" alt="키움밥상 로고" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-3">
          우리 아이 <span className="text-primary-500">건강한 식습관</span>
        </h1>
        <p className="text-neutral-600 text-center mb-12 text-base">
          이 앱은 아동복지카드 사용자를 위한 앱입니다.<br />
          우리 아이의 건강한 성장을 위해 식단 관리를 시작하세요
        </p>
        <div className="w-full max-w-sm">
          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate('/login')}
          >
            로그인
          </Button>
        </div>
      </section>
    </div>
  );
};

export default StartPage;
