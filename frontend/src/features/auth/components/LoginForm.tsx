import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../../../api/client';
import { jwtDecode } from 'jwt-decode';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  // 시연용: IP 주소로 접속했을 때 임시 자동 로그인
  const handleDemoLogin = async () => {
    console.log('시연 모드: 로그인 버튼 클릭');
    setIsLoading(true);
    
    try {
      const hostname = window.location.hostname;
      console.log('현재 hostname:', hostname);
      
      // 임시로 특정 이메일로 로그인 처리
      const demoEmail = 'mjc2025504585@gmail.com';
      const demoGoogleId = 'demo_google_id_for_' + demoEmail;
      const demoName = '양가윤';
      
      console.log('시연 모드: 자동 로그인 처리 시작', { demoEmail, demoGoogleId, demoName });
      
      // 즉시 로그인 처리 (API 호출 없이)
      localStorage.setItem('user_id', '1');
      localStorage.setItem('user_info', JSON.stringify({
        google_id: demoGoogleId,
        email: demoEmail,
        name: demoName
      }));
      
      console.log('사용자 정보 저장 완료');
      console.log('localStorage 확인:', {
        user_id: localStorage.getItem('user_id'),
        user_info: localStorage.getItem('user_info')
      });
      
      // 백엔드 API 호출은 백그라운드에서 시도 (실패해도 무시)
      api.user.googleAuth({
        credential: 'demo_credential',
        google_id: demoGoogleId,
        email: demoEmail,
        name: demoName,
      }).then(({ data, error }) => {
        if (!error && data?.user_id) {
          console.log('백엔드 응답 받음, user_id 업데이트:', data.user_id);
          localStorage.setItem('user_id', data.user_id.toString());
          if (data.username) {
            localStorage.setItem('user_info', JSON.stringify({
              google_id: data.google_id || demoGoogleId,
              email: data.email || demoEmail,
              name: data.username || demoName
            }));
          }
        } else {
          console.warn('백엔드 응답 실패, 임시 user_id 사용:', error);
        }
      }).catch((err) => {
        console.warn('백엔드 호출 실패 (무시):', err);
      });
      
      console.log('홈 페이지로 이동 중...');
      try {
        navigate('/home');
        console.log('navigate 호출 완료');
      } catch (navError) {
        console.warn('navigate 실패, window.location 사용:', navError);
        window.location.href = '/home';
      }
      
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          console.log('navigate가 작동하지 않음, window.location으로 이동');
          window.location.href = '/home';
        }
      }, 500);
      
    } catch (err) {
      console.error('시연 모드 로그인 실패:', err);
      // 에러 발생 시에도 임시 로그인
      localStorage.setItem('user_id', '1');
      localStorage.setItem('user_info', JSON.stringify({
        google_id: 'demo_google_id',
        email: 'mjc2025504585@gmail.com',
        name: '양가윤'
      }));
      try {
        navigate('/home');
      } catch (navError) {
        window.location.href = '/home';
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;
      const decoded: any = jwtDecode(credential);
      const { sub: google_id, email, name } = decoded;

      console.log('🔍 구글 로그인 정보:', { google_id, email, name });

      const { data, error } = await api.user.googleAuth({
        credential,
        google_id,
        email,
        name,
      });

      if (error) throw new Error(error);
      console.log('📥 서버 응답 data 필드:', data);

      console.log('✅ 사용자 데이터:', data);
      console.log('✅ is_new_user 값:', data?.is_new_user);
      console.log('✅ user_id 값:', data?.user_id);

      // user_id가 있으면 localStorage에 저장
      if (data?.user_id) {
        localStorage.setItem('user_id', data.user_id.toString());
        console.log('💾 user_id 저장됨:', data.user_id);
      }

      // 사용자 상태에 따른 라우팅
      console.log('🔍 라우팅 결정 중...');
      console.log('🔍 userData?.is_new_user:', data?.is_new_user);
      console.log('🔍 typeof userData?.is_new_user:', typeof data?.is_new_user);
      console.log('🔍 userData?.is_new_user === true:', data?.is_new_user);
      
      if (data) {
        localStorage.setItem('user_info', JSON.stringify({
          google_id: data.google_id,
          email: data.email,
          name: data.username
        }));

        if (data?.is_new_user) {
          console.log('🆕 신규 사용자 - 추가 정보 입력 페이지로 이동');
          navigate('/additional-info');
        } else {
          console.log('👤 기존 사용자 - 홈 페이지로 이동');
          navigate('/home');
        }
      }

    } catch (err) {
      console.error('❌ Google 로그인 처리 실패:', err);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleGoogleError = () => {
    console.log('Google 로그인 실패');
    // IP 주소로 접속했을 때는 자동 로그인 처리
    const hostname = window.location.hostname;
    const isDemoIP = hostname === '172.111.112.243';
    const isLocalNetwork = hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('ngrok');
    if (isDemoIP || isLocalNetwork) {
      console.log('🔧 시연 모드: Google OAuth 실패, 자동 로그인 처리');
      handleDemoLogin();
    }
  };
  return (
    <motion.div
      className="w-full max-w-md mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="mt-2 text-gray-600">키움밥상에 오신 것을 환영합니다</p> */}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-center"
      >
        {(() => {
          const hostname = window.location.hostname;
          const isDemoIP = hostname === '172.111.112.243';
          const isLocalNetwork = hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('ngrok');
          
          // IP 주소로 접속했을 때는 시연용 로그인 버튼 표시
          if (isDemoIP || isLocalNetwork) {
            return (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔧 버튼 클릭 이벤트 발생');
                  handleDemoLogin();
                }}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minWidth: '240px', justifyContent: 'center' }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.965-2.184l-2.908-2.258c-.806.54-1.837.86-3.057.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                      <path d="M3.947 10.698c-.18-.54-.282-1.117-.282-1.698s.102-1.158.282-1.698V4.97H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.03l2.99-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.97L3.947 7.302C4.66 5.167 6.65 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Google 계정으로 로그인
                  </>
                )}
              </button>
            );
          }
          
          // localhost나 ngrok으로 접속했을 때는 일반 Google 로그인
          return (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          );
        })()}
      </motion.div>
    </motion.div>
  );
};