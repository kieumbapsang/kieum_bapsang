import React from 'react';
import { FAQ } from '../features/mypage/components/FAQ';

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">설정</h1>
      
      <div className="space-y-6">
        <FAQ />
      </div>
    </div>
  );
};
