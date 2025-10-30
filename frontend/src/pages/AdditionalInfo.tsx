import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../api/client';
import { Select } from '../components/ui/Select';

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
    age: '',
    height: '',
    weight: '',
    address: '',
    protector_name: '',
    protector_phone: '',
    protector_relationship: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [googleUserInfo, setGoogleUserInfo] = useState<any>(null);

  // 컴포넌트 마운트 시 구글 사용자 정보 확인
  useEffect(() => {
    const checkGoogleUserInfo = () => {
      // localStorage에서 구글 사용자 정보 확인
      const storedGoogleInfo = localStorage.getItem('google_user_info');
      if (storedGoogleInfo) {
        const userInfo = JSON.parse(storedGoogleInfo);
        setGoogleUserInfo(userInfo);
        setFormData(prev => ({
          ...prev,
          name: userInfo.name || ''
        }));
      } else {
        // 구글 정보가 없으면 로그인 페이지로 리다이렉트
        console.log('구글 사용자 정보가 없습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
      }
    };

    checkGoogleUserInfo();
  }, [navigate]);
  
  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthDateValue = e.target.value;
    const birthDate = new Date(birthDateValue);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    setFormData(prev => ({
      ...prev,
      birthDate: birthDateValue,
      age: age.toString(),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!googleUserInfo) {
        throw new Error('구글 사용자 정보가 없습니다.');
      }

      // 생년월일로부터 나이 계산
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      // 사용자 프로필 데이터 생성
      const profileData = {
        google_id: googleUserInfo.google_id,
        email: googleUserInfo.email,
        username: formData.name,
        age: age,
        birth: formData.birthDate,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        address: formData.address,
        protector_name: formData.protector_name || null,
        protector_phone: formData.protector_phone || null,
        protector_relationship: formData.protector_relationship || null
      };

      console.log('📝 프로필 데이터:', profileData);

      // API 호출하여 사용자 프로필 생성
      const { data, error } = await api.user.createProfile(profileData);
      
      if (error) {
        throw new Error(error);
      }

      console.log('✅ 프로필 생성 성공:', data);

      // 성공 시 localStorage에 사용자 ID 저장
      localStorage.setItem('user_id', data.id.toString());
      
      // 구글 사용자 정보 정리
      localStorage.removeItem('google_user_info');
      
      console.log('🏠 홈 페이지로 이동');
      navigate('/home'); // 홈 페이지로 이동
    } catch (error) {
      console.error('❌ 추가 정보 저장 실패:', error);
      alert('정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectList = [
    {value: 'parents', name: '부모'},
    {value: 'grandparents', name: '조부모'},
    {value: 'relative', name: '친척'},
    {value: 'etc', name: '기타'},
  ];
  
  const [selected, setSelected] = useState('보호자 관계');

  const handleSelect = (e: string) => {
    setSelected(e)
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
            보호자 정보는 선택 입력 사항입니다
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
                onChange={handleBirthChange}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                나이
              </label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="자동 계산"
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
                <p className="mt-1 text-sm text-gray-500 text-right">선택사항</p>
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
                <p className="mt-1 text-sm text-gray-500 text-right">선택사항</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  보호자 관계
                </label>
                <Select
                  name="protector_relationship"
                  value={formData.protector_relationship}
                  onChange={handleChange}
                  helperText="선택사항"
                  required={false}
                >
                  <option value="" disabled selected hidden>선택해주세요</option>
                  <option value="parents">부모</option>
                  <option value="grandparents">조부모</option>
                  <option value="relative">친척</option>
                  <option value="etc">기타</option>
                </Select>
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
