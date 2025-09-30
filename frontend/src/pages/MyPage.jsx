import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const MyPage = () => {
  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-2xl font-bold">내 정보</h1>
      
      <div className="mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="mr-4 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-500">홍</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">홍길동</h2>
              <p className="text-neutral-600">user@example.com</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-medium">계정 설정</h2>
        <Card className="divide-y divide-neutral-200">
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">프로필 수정</h3>
              <p className="text-sm text-neutral-600">이름, 이메일 등 기본 정보 변경</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">비밀번호 변경</h3>
              <p className="text-sm text-neutral-600">계정 보안을 위한 비밀번호 변경</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">알림 설정</h3>
              <p className="text-sm text-neutral-600">앱 알림 및 이메일 수신 설정</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-medium">고객 지원</h2>
        <Card className="divide-y divide-neutral-200">
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">자주 묻는 질문</h3>
              <p className="text-sm text-neutral-600">일반적인 질문에 대한 답변</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">문의하기</h3>
              <p className="text-sm text-neutral-600">도움이 필요하시면 문의해주세요</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <Button variant="outline" className="w-full">
          로그아웃
        </Button>
      </div>
      
      <div className="text-center">
        <button className="text-sm text-destructive-500">계정 삭제</button>
      </div>
    </div>
  );
};
