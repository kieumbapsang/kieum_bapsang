import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-2xl font-bold">설정</h1>
      
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-medium">앱 설정</h2>
        <Card className="divide-y divide-neutral-200">
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">다크 모드</h3>
              <p className="text-sm text-neutral-600">어두운 테마로 전환</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">언어 설정</h3>
              <p className="text-sm text-neutral-600">앱 표시 언어 변경</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">한국어</span>
              <svg className="ml-1 inline h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-medium">알림 설정</h2>
        <Card className="divide-y divide-neutral-200">
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">푸시 알림</h3>
              <p className="text-sm text-neutral-600">앱 푸시 알림 수신 여부</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={() => setPushNotifications(!pushNotifications)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">이메일 알림</h3>
              <p className="text-sm text-neutral-600">이메일 알림 수신 여부</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-neutral-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-medium">데이터 관리</h2>
        <Card className="divide-y divide-neutral-200">
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">데이터 내보내기</h3>
              <p className="text-sm text-neutral-600">식사 및 영양 데이터 내보내기</p>
            </div>
            <Button variant="outline" size="sm">내보내기</Button>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">캐시 삭제</h3>
              <p className="text-sm text-neutral-600">앱 캐시 데이터 삭제</p>
            </div>
            <Button variant="outline" size="sm">삭제</Button>
          </div>
        </Card>
      </div>
      
      <div className="text-center text-sm text-neutral-500">
        <p>앱 버전: 1.0.0</p>
      </div>
    </div>
  );
};
