import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../../../api/client';
import { jwtDecode } from 'jwt-decode';

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0
  },
  transition: {
    duration: 0.5
  }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0
  },
  transition: {
    duration: 0.3
  }
};

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="mt-2 text-gray-600">키움밥상에 오신 것을 환영합니다</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-center"
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
        />
      </motion.div>
    </motion.div>
  );
};