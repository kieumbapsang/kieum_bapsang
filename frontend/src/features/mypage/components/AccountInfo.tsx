import React, { useState } from 'react';

interface GuardianInfo {
  name: string;
  phone: string;
  relationship: string;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  guardian?: GuardianInfo;
}

export const AccountInfo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '홍길동',  // TODO: API에서 실제 사용자 정보 가져오기
    email: 'example@email.com',
    phone: '010-1234-5678'
  });
  
  const [isAddingGuardian, setIsAddingGuardian] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 연동하여 사용자 정보 업데이트
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전화번호
            </label>
            <input
              type="tel"
              value={userInfo.phone}
              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">보호자 정보</h3>
              {!userInfo.guardian && !isAddingGuardian && (
                <button
                  type="button"
                  onClick={() => setIsAddingGuardian(true)}
                  className="text-primary-500 hover:text-primary-600"
                >
                  보호자 추가하기
                </button>
              )}
            </div>
            {(userInfo.guardian || isAddingGuardian) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보호자 이름
                  </label>
                  <input
                    type="text"
                    value={userInfo.guardian?.name || ''}
                    onChange={(e) => setUserInfo({
                      ...userInfo,
                      guardian: {
                        ...(userInfo.guardian || { phone: '', relationship: '부모' }),
                        name: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보호자 전화번호
                  </label>
                  <input
                    type="tel"
                    value={userInfo.guardian?.phone || ''}
                    onChange={(e) => setUserInfo({
                      ...userInfo,
                      guardian: {
                        ...(userInfo.guardian || { name: '', relationship: '부모' }),
                        phone: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    관계
                  </label>
                  <select
                    value={userInfo.guardian?.relationship || '부모'}
                    onChange={(e) => setUserInfo({
                      ...userInfo,
                      guardian: {
                        ...(userInfo.guardian || { name: '', phone: '' }),
                        relationship: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="부모">부모</option>
                    <option value="조부모">조부모</option>
                    <option value="친척">친척</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mt-6"
          >
            저장
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">이름</p>
            <p className="mt-1">{userInfo.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">이메일</p>
            <p className="mt-1">{userInfo.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">전화번호</p>
            <p className="mt-1">{userInfo.phone}</p>
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">보호자 정보</h3>
              {!userInfo.guardian && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsAddingGuardian(true);
                  }}
                  className="text-primary-500 hover:text-primary-600"
                >
                  보호자 추가하기
                </button>
              )}
            </div>
            {userInfo.guardian ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">보호자 이름</p>
                  <p className="mt-1">{userInfo.guardian.name}</p>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">보호자 전화번호</p>
                  <p className="mt-1">{userInfo.guardian.phone}</p>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">관계</p>
                  <p className="mt-1">{userInfo.guardian.relationship}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">등록된 보호자 정보가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
