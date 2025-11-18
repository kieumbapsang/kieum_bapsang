import React from 'react';
import { FAQ } from '../features/mypage/components/FAQ';
import { ModeSwitch } from '../components/ui/ModeSwitch';

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">설정</h1>
      
      <div className="space-y-6 [&>div:last-child]:pb-0">
        <ModeSwitch />
        <FAQ />
      </div>
    </div>
  );
};
