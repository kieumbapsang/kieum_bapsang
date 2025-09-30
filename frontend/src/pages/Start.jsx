import React from 'react';
import { Button } from '../components/ui/Button';

export const StartPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="mb-10 text-center">
        <img
          src="/favicon.ico"
          alt="키움밥상 로고"
          className="mx-auto w-64 h-auto mb-6"
        />
        <p className="text-lg text-neutral-600">건강한 식습관을 위한 첫걸음</p>
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <Button className="w-full" onClick={() => window.location.href = '/login'}>
          로그인
        </Button>
        <Button className="w-full" variant="outline" onClick={() => window.location.href = '/signup'}>
          회원가입
        </Button>
        <Button className="w-full" variant="ghost" onClick={() => window.location.href = '/home'}>
          둘러보기
        </Button>
      </div>
    </div>
  );
};
