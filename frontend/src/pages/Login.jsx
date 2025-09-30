import React, { useState } from 'react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제 구현에서는 인증 로직이 들어갑니다
    console.log('로그인:', { email, password });
    window.location.href = '/home';
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* 상단 로고 */}
        <div className="text-center mb-8">
          <img
            src="/favicon.ico"
            alt="로고"
            className="mx-auto w-32 h-32 mb-6"
          />
        </div>
        
        <div className="bg-white rounded-3xl shadow-md p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">로그인</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-400 hover:bg-green-500 text-white font-medium rounded-xl transition duration-200"
              >
                로그인
              </button>
            </div>
          </form>
          
          {/* 소셜 로그인 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">간편 로그인</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => console.log('구글 로그인')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" 
                  fill="#4285F4"/>
                </svg>
                구글 로그인
              </button>
              
              <button
                type="button"
                onClick={() => console.log('카카오 로그인')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-xl bg-[#FEE500] text-sm font-medium text-[#3A1D1D] hover:bg-[#FDD835]"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C6.5 3 2 6.3 2 10.5c0 2.9 1.9 5.3 4.8 6.7-.2.7-.7 2.6-.8 3-.1.5.2.5.4.3.2-.1 2.5-1.7 3.5-2.4.7.1 1.4.2 2.1.2 5.5 0 10-3.3 10-7.5S17.5 3 12 3z" 
                  fill="#3A1D1D"/>
                </svg>
                카카오 로그인
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요? <a href="/signup" className="text-green-500 hover:text-green-600">회원가입</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};