import React, { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import { Input } from '../../.././components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { set } from 'date-fns';

interface UserInfo {
  name: string;
  email: string;
  birthDate: string;
  age: string;
  height: string;
  weight: string;
  address: string;
  protector_name: string;
  protector_phone: string;
  protector_relationship: string;
}

export const AccountInfo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    birthDate: '',
    age: '',
    height: '',
    weight: '',
    address: '',
    protector_name: '',
    protector_phone: '',
    protector_relationship: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;
        const { data } = await api.user.getProfile(userId);
        if (data) {
          setUserInfo({
            name: data.username,
            email: data.email,
            birthDate: data.birth,
            age: data.age.toString(),
            height: data.height.toString(),
            weight: data.weight.toString(),
            address: data.address,
            protector_name: data.protector_name || '',
            protector_phone: data.protector_phone || '',
            protector_relationship: data.protector_relationship || '',
          });
        }
      } catch (e) {
        console.error('프로필 불러오기 실패:', e);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; 
    const formattedValue = value.replace(/[^0-9.]/g, "")
      .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
      .replace(/(-{1,2})$/g, "");
    setUserInfo((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleDeleteProtector = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('사용자 ID가 없습니다.');

      const updateData = {
        protector_name: '',
        protector_phone: '',
        protector_relationship: '',
      }; 

      const { error } = await api.user.updateProfile(userId, updateData);
      if (error) throw new Error(error);

      setUserInfo((prev) => ({
        ...prev,
        protector_name: '', 
        protector_phone: '',
        protector_relationship: '',
      }));
      console.log('보호자 정보가 성공적으로 삭제되었습니다.');
      setIsModalOpen(false);
    } catch (err) {
      console.error('보호자 정보 삭제 실패:', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('사용자 ID가 없습니다.');

      const updateData = {
        username: userInfo.name,
        age: parseInt(userInfo.age, 10),
        birth: userInfo.birthDate,
        height: parseFloat(userInfo.height),
        weight: parseFloat(userInfo.weight),
        address: userInfo.address,
        protector_name: userInfo.protector_name || null,
        protector_phone: userInfo.protector_phone || null,
        protector_relationship: userInfo.protector_relationship || null,
      };

      const { error } = await api.user.updateProfile(userId, updateData);
      if (error) throw new Error(error);

      console.log('정보가 성공적으로 수정되었습니다.');
      setIsEditing(false);
    } catch (err) {
      console.error('정보 수정 실패:', err);
      console.log('정보 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm relative">
      
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteProtector}
        title="보호자 정보 삭제"
        message="보호자 정보를 정말로 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
      />

      {/* <div className="bg-white rounded-2xl p-6 shadow-sm"> */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">계정 정보</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary-500 hover:text-primary-600"
          >
            {isEditing ? '취소' : '수정'}
          </button>
        </div>

        {isEditing ? (
          // ----------- 수정모드 -----------
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <Input name="name" value={userInfo.name} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <Input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">생년월일</label>
              <Input
                type="date"
                name="birthDate"
                value={userInfo.birthDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">나이</label>
              <Input
                type="number"
                name="age"
                value={userInfo.age}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">키 (cm)</label>
              <Input
                type="number"
                name="height"
                value={userInfo.height}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">몸무게 (kg)</label>
              <Input
                type="number"
                name="weight"
                value={userInfo.weight}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">거주지</label>
              <Input
                name="address"
                value={userInfo.address}
                onChange={handleChange}
              />
            </div>

            <div className="border-t pt-4 mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold mb-2">보호자 정보</h3>

                <button
                  className="text-primary-500 hover:text-primary-600"
                  // variant="destructive"
                  onClick={() => setIsModalOpen(true)}
                >
                    보호자 삭제
                </button>
                {/* <Button
                  type="button"
                  variant="destructive"
                  className="text-red-600 border border-red-500 px-3 py-1 text-sm hover:bg-red-50"
                  onClick={() => setIsModalOpen(true)}
                >
                  보호자 정보 삭제
                </Button> */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">보호자 이름</label>
                <Input
                  name="protector_name"
                  value={userInfo.protector_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">보호자 전화번호</label>
                <Input
                  name="protector_phone"
                  value={userInfo.protector_phone}
                  onChange={handlePhoneNumber}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">관계</label>
                <Select
                  name="protector_relationship"
                  value={userInfo.protector_relationship}
                  onChange={handleChange}
                >
                  <option value="" hidden>선택해주세요</option>
                  <option value="부모">부모</option>
                  <option value="조부모">조부모</option>
                  <option value="친척">친척</option>
                  <option value="기타">기타</option>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6">
              저장
            </Button>
          </form>
        ) : (
          <div className="space-y-5 text-gray-800">
            {/* 기본정보 */}
            <div>
              <p className="text-sm text-gray-500">이름</p>
              <p className="text-base font-medium text-gray-900 mt-1">{userInfo.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">이메일</p>
              <p className="text-base font-medium text-gray-900 mt-1">{userInfo.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">생년월일</p>
              <p className="text-base font-medium text-gray-900 mt-1">{userInfo.birthDate}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">나이</p>
              <p className="text-base font-medium text-gray-900 mt-1">{userInfo.age}세</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">키</p>
              <p className="text-base font-medium text-gray-900 mt-1">{userInfo.height}cm</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">몸무게</p>
              <p className="text-base font-medium text-gray-900 mt-1">{userInfo.weight}kg</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">거주지</p>
              <p className="text-base font-medium text-gray-900 mt-1">{userInfo.address}</p>
            </div>

            {/* 보호자 정보 */}
            <div className="border-t pt-5 mt-6">
              <p className="text-md font-semibold text-gray-900 mb-3">보호자 정보</p>
              {(userInfo.protector_name || userInfo.protector_phone || userInfo.protector_relationship) ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500">보호자 이름</p>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {userInfo.protector_name || '-'}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">보호자 전화번호</p>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {userInfo.protector_phone || '-'}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">관계</p>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {userInfo.protector_relationship || '-'}
                    </p>
                  </div>
                </>
              ) : (
              <p className="text-sm text-gray-500">등록된 보호자 정보가 없습니다.</p>
              )}
            </div>
            <Button type="submit" className="w-full mt-6 bg-gray-400" onClick={() => {
              localStorage.removeItem('user_id');
              // localStorage.removeItem('token');
              window.location.href = '/login';
            }}>
              로그아웃
            </Button>
          </div>
        )}
      </div>
  );
};