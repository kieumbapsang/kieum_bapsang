import React from 'react';
import { AccountInfo } from '../features/mypage/components/AccountInfo';
import { PasswordChange } from '../features/mypage/components/PasswordChange';

export const MyPage: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>
      
      <div className="space-y-6">
        <AccountInfo />
        <PasswordChange />
      </div>
    </div>
  );
};
