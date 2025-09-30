import React from 'react';
import { LoginForm } from '../features/auth/components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-32 h-32 mb-8">
        <img src="/favicon.ico" alt="키움밥상 로고" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-2xl font-bold text-center mb-3">
        우리 아이 <span className="text-primary-500">건강한 식습관</span>
      </h1>
      <p className="text-neutral-600 text-center mb-12">
        구글 계정으로 간편하게 시작하세요
      </p>
      <LoginForm />
    </div>
  );
};

export default LoginPage;

