/**
 * ProfilePage 컴포넌트
 *
 * Kids Mode 내정보 페이지
 *
 * **시안 디자인 스펙:**
 * - 프로필 카드 (이름, 나이, 키, 체중, BMI)
 * - 보호자 정보
 * - 내 활동 통계
 * - 자주 묻는 질문 (FAQ)
 * - 로그아웃 버튼
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { FAQ } from '../features/mypage/components/FAQ';
import { useUser } from '../contexts/UserContext';
import { useModeStore } from '../stores/useModeStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  User,
  Phone,
  LogOut,
  Trophy,
  TrendingUp,
  Flame,
  Edit,
  LayoutGrid,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '../components/ui/Input';

/**
 * ProfilePage Props 인터페이스
 */
interface ProfilePageProps {
  onLogout?: () => void;
}

/**
 * ProfilePage 컴포넌트
 *
 * Kids Mode에서 사용자의 프로필 정보와 설정을 관리하는 페이지입니다.
 *
 * @param {ProfilePageProps} props - 컴포넌트 props
 * @param {() => void} props.onLogout - 로그아웃 콜백 함수
 * @returns {React.ReactElement} ProfilePage UI
 *
 * @example
 * ```tsx
 * <ProfilePage onLogout={() => console.log('로그아웃')} />
 * ```
 */
export function ProfilePage({ onLogout }: ProfilePageProps) {
  const { userInfo, updateUserInfo } = useUser();
  const { toggleMode } = useModeStore();
  const navigate = useNavigate();
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isGuardianEditOpen, setIsGuardianEditOpen] = useState(false);
  const [isModeDialogOpen, setIsModeDialogOpen] = useState(false);

  // 프로필 수정 폼 상태
  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
  });

  // 보호자 정보 수정 폼 상태
  const [guardianForm, setGuardianForm] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  // 더미 데이터 초기화 (userInfo가 비어있을 때만)
  useEffect(() => {
    if (!userInfo.name) {
      updateUserInfo({
        name: '신짱구',
        age: '5',
        height: '105',
        weight: '17',
        guardian: {
          name: '봉미선',
          phone: '010-1234-5678',
          relationship: '엄마',
        },
      });
    }
  }, []);

  // userInfo가 변경될 때 폼 상태 업데이트
  useEffect(() => {
    setProfileForm({
      name: userInfo.name || '',
      age: userInfo.age || '',
      height: userInfo.height || '',
      weight: userInfo.weight || '',
    });

    setGuardianForm({
      name: userInfo.guardian?.name || '',
      phone: userInfo.guardian?.phone || '',
      relationship: userInfo.guardian?.relationship || '',
    });
  }, [userInfo]);

  // BMI 계산
  const calculateBMI = () => {
    const height = parseFloat(userInfo.height);
    const weight = parseFloat(userInfo.weight);

    if (!height || !weight || height <= 0) return '0.0';

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const bmi = calculateBMI();

  // 프로필 수정 저장
  const handleProfileSave = () => {
    updateUserInfo({
      name: profileForm.name,
      age: profileForm.age,
      height: profileForm.height,
      weight: profileForm.weight,
    });
    setIsProfileEditOpen(false);
  };

  // 보호자 정보 수정 저장
  const handleGuardianSave = () => {
    updateUserInfo({
      guardian: {
        name: guardianForm.name,
        phone: guardianForm.phone,
        relationship: guardianForm.relationship,
      },
    });
    setIsGuardianEditOpen(false);
  };

  // 모드 변경 핸들러
  const handleModeChange = useCallback(() => {
    toggleMode();
    navigate('/home');
  }, [toggleMode, navigate]);

  const handleModeCancel = useCallback(() => {
    // 다이얼로그만 닫힘
  }, []);

  // 활동 정보 (더미 데이터)
  const mealRecords = 42;
  const streakDays = 5;
  const badges = 12;

  const name = userInfo.name || '친구';
  const age = parseInt(userInfo.age) || 0;
  const height = parseFloat(userInfo.height) || 0;
  const weight = parseFloat(userInfo.weight) || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-gray-900 mb-2">내 정보</h1>
        <p className="text-gray-600">프로필과 설정을 관리해요</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 border-2 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-2xl">
              {name.substring(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-gray-900">{name}</h2>
              <Badge variant="secondary" className="text-xs">
                {age}살
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>배지 {badges}개</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsProfileEditOpen(true)}
            className="shrink-0"
          >
            <Edit className="w-4 h-4 mr-1" />
            수정
          </Button>
        </div>

        {/* 신체 정보 그리드 */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">키</p>
            <p className="text-lg font-bold text-gray-900">{height}cm</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">체중</p>
            <p className="text-lg font-bold text-gray-900">{weight}kg</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">BMI</p>
            <p className="text-lg font-bold text-gray-900">{bmi}</p>
          </div>
        </div>
      </Card>

      {/* 보호자 정보 */}
      <Card className="p-6 border-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">보호자 정보</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsGuardianEditOpen(true)}
          >
            <Edit className="w-4 h-4 mr-1" />
            수정
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">이름</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">
                  {userInfo.guardian?.name || '-'}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {userInfo.guardian?.relationship || '-'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">전화번호</p>
              <p className="font-semibold text-gray-900">
                {userInfo.guardian?.phone || '-'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 내 활동 */}
      <Card className="p-6 border-2 bg-gradient-to-br from-orange-50 to-yellow-50">
        <h3 className="text-gray-900 mb-4">📊 내 활동</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mealRecords}</p>
              <p className="text-sm text-gray-600">식사 기록</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{streakDays}</p>
              <p className="text-sm text-gray-600">연속 일수</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 자주 묻는 질문 */}
      <FAQ />

      {/* 모드 변경 버튼 */}
      <Card className="p-4 border-2">
        <Button
          variant="outline"
          className="w-full h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          onClick={() => setIsModeDialogOpen(true)}
        >
          <LayoutGrid className="w-5 h-5 mr-2" />
          기본 모드로 변경
        </Button>
      </Card>

      {/* 로그아웃 버튼 */}
      <Button
        variant="outline"
        className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        onClick={onLogout}
      >
        <LogOut className="w-5 h-5 mr-2" />
        로그아웃
      </Button>

      {/* 모드 변경 확인 다이얼로그 */}
      <ConfirmDialog
        open={isModeDialogOpen}
        onOpenChange={setIsModeDialogOpen}
        title="기본 모드로 변경"
        description="정보를 깔끔하게 볼 수 있는 기본모드로 변경됩니다."
        onConfirm={handleModeChange}
        onCancel={handleModeCancel}
        confirmText="변경"
        cancelText="취소"
      />

      {/* 프로필 수정 모달 */}
      <Dialog.Root open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-[90%] max-w-md z-50 shadow-xl">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
              프로필 수정
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <Input
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  나이
                </label>
                <Input
                  type="number"
                  value={profileForm.age}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, age: e.target.value })
                  }
                  placeholder="나이를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  키 (cm)
                </label>
                <Input
                  type="number"
                  value={profileForm.height}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, height: e.target.value })
                  }
                  placeholder="키를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  체중 (kg)
                </label>
                <Input
                  type="number"
                  value={profileForm.weight}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, weight: e.target.value })
                  }
                  placeholder="체중을 입력하세요"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsProfileEditOpen(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button onClick={handleProfileSave} className="flex-1">
                저장
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 보호자 정보 수정 모달 */}
      <Dialog.Root open={isGuardianEditOpen} onOpenChange={setIsGuardianEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-[90%] max-w-md z-50 shadow-xl">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
              보호자 정보 수정
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  보호자 이름
                </label>
                <Input
                  value={guardianForm.name}
                  onChange={(e) =>
                    setGuardianForm({ ...guardianForm, name: e.target.value })
                  }
                  placeholder="보호자 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  관계
                </label>
                <Input
                  value={guardianForm.relationship}
                  onChange={(e) =>
                    setGuardianForm({
                      ...guardianForm,
                      relationship: e.target.value,
                    })
                  }
                  placeholder="관계를 입력하세요 (예: 엄마, 아빠)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <Input
                  type="tel"
                  value={guardianForm.phone}
                  onChange={(e) =>
                    setGuardianForm({ ...guardianForm, phone: e.target.value })
                  }
                  placeholder="전화번호를 입력하세요"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsGuardianEditOpen(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button onClick={handleGuardianSave} className="flex-1">
                저장
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
