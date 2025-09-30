import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

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
    console.log('Google 로그인 성공:', credentialResponse);
    try {
      // TODO: 백엔드로 토큰을 전송하고 사용자 정보를 받아오는 API 호출
      // const response = await api.post('/auth/google', { credential: credentialResponse.credential });
      
      // 새로운 사용자인 경우 추가 정보 입력 페이지로 이동
      navigate('/additional-info');
      
      // 기존 사용자인 경우 홈으로 이동
      // navigate('/home');
    } catch (error) {
      console.error('Google 로그인 처리 실패:', error);
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