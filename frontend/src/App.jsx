import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AddMealModal } from './features/meals/components/AddMealModal';

// 페이지 컴포넌트 import
import { StartPage } from './pages/Start';
import { DashboardPage } from './pages/Dashboard';
import { LoginPage } from './pages/Login';
import { NutritionAnalysisPage } from './pages/NutritionAnalysis';
import { CalendarPage } from './pages/Calendar';
import AdditionalInfoPage from './pages/AdditionalInfo';

// 페이지 컴포넌트 import
import { MyPage } from './pages/MyPage';
import { SettingsPage } from './pages/Settings';

import { MealsPage } from './pages/Meals';

// 아직 구현되지 않은 페이지 컴포넌트
const StoresPage = () => <div className="p-8 text-center">상점</div>;

// 네비게이션 아이템 정의

// 레이아웃 컴포넌트
const Layout = ({ children }) => {
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const location = useLocation();
  
  // 네비게이션 아이템 정의
  const navItems = [
    {
      path: '/home',
      label: '홈',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/stats',
      label: '영양분석',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      path: '/meals',
      label: '식사',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5h2v14h-2zM7 5h2v14h-2zM15 5c0 0 4 0 4 4s-3 4-3 4v6h-2V5h1z" />
        </svg>
      )
    },
    {
      path: '/mypage',
      label: '내정보',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
  <div className="min-h-screen flex flex-col bg-white">
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-50">
      <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center">
          <span className="text-lg font-bold text-neutral-900">키움밥상</span>
        </div>
        <div className="flex items-center gap-1">
          <Link to="/calendar" className="p-2 text-neutral-600 active:text-primary-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Link>
          <a href="/settings" className="p-2 text-neutral-600 active:text-primary-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="h-[env(safe-area-inset-top)] bg-white" />
    </header>
    <main className="flex-grow pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))]">
      {children}
    </main>
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 ${
              location.pathname === item.path
                ? 'text-primary-500'
                : 'text-neutral-600 active:text-primary-500'
            }`}
          >
            <div className={`${location.pathname === item.path ? 'text-primary-500' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-xs font-medium ${
              location.pathname === item.path ? 'text-primary-500' : ''
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
        <button 
          onClick={() => setIsMealModalOpen(true)}
          className="flex flex-col items-center justify-center"
        >
          <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center -mt-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </button>
        {navItems.slice(2).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 ${
              location.pathname === item.path
                ? 'text-primary-500'
                : 'text-neutral-600 active:text-primary-500'
            }`}
          >
            <div className={`${location.pathname === item.path ? 'text-primary-500' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-xs font-medium ${
              location.pathname === item.path ? 'text-primary-500' : ''
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </nav>
    <AddMealModal 
      isOpen={isMealModalOpen}
      onClose={() => setIsMealModalOpen(false)}
    />
  </div>
  );
};

// QueryClient 생성
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId="748625038020-uhmonn17q232nvqgqo2rmn7vdnh8ak4b.apps.googleusercontent.com">
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/home" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/meals" element={<Layout><MealsPage /></Layout>} />
          <Route path="/stats" element={<Layout><NutritionAnalysisPage /></Layout>} />
          <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
          <Route path="/stores" element={<Layout><StoresPage /></Layout>} />
          <Route path="/mypage" element={<Layout><MyPage /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
          <Route path="/additional-info" element={<AdditionalInfoPage />} />
        </Routes>
      </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
