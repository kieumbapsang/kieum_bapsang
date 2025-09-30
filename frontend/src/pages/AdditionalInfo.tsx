import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0
  },
  transition: {
    type: "spring",
    stiffness: 260,
    damping: 20
  }
};

const AdditionalInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    height: '',
    weight: '',
    address: '',
    protector_name: '',
    protector_phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: API 호출하여 추가 정보 저장
      console.log('추가 정보 저장:', formData);
      navigate('/home'); // 홈 페이지로 이동
    } catch (error) {
      console.error('추가 정보 저장 실패:', error);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            추가 정보 입력
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            키, 몸무게, 생년월일, 거주지는 필수 입력 사항입니다
          </p>
          <p className="text-sm text-gray-500">
            보호자 정보는 선택적으로 입력하실 수 있습니다
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
                <label className="block text-sm font-medium text-gray-700">
                이름
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="mt-1"
                />
              </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                생년월일
              </label>
              <Input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                키 (cm)
              </label>
              <Input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="170"
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                몸무게 (kg)
              </label>
              <Input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="65"
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                거주지
              </label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="서울시 강남구"
                className="mt-1"
                required
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  보호자 이름
                </label>
                <Input
                  type="text"
                  name="protector_name"
                  value={formData.protector_name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-gray-500">선택사항</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  보호자 연락처
                </label>
                <Input
                  type="tel"
                  name="protector_phone"
                  value={formData.protector_phone}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-gray-500">선택사항</p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full flex justify-center"
              >
                시작하기
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AdditionalInfoPage;
