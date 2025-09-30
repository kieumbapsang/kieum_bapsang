import React, { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [faqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: '키움밥상은 어떤 서비스인가요?',
      answer: '키움밥상은 아이들의 건강한 식습관 형성을 돕는 식사 기록 및 영양 관리 서비스입니다. 매일의 식사를 기록하고 영양 섭취 현황을 분석하여 맞춤형 피드백을 제공합니다.'
    },
    {
      id: '2',
      question: '식사 기록은 어떻게 하나요?',
      answer: '하단 네비게이션 바의 + 버튼을 눌러 식사를 기록할 수 있습니다. 직접 입력하거나 사진을 찍어 간편하게 기록할 수 있습니다.'
    },
    {
      id: '3',
      question: '영양 분석은 어떻게 이루어지나요?',
      answer: '입력하신 식사 정보를 바탕으로 영양소별 섭취량을 계산하고, 연령대별 권장 섭취량과 비교하여 분석 결과를 제공합니다.'
    },
    {
      id: '4',
      question: '알레르기 정보는 어떻게 등록하나요?',
      answer: '마이페이지 > 계정 정보에서 알레르기 정보를 등록할 수 있습니다. 등록된 알레르기 정보는 식사 기록 시 자동으로 체크됩니다.'
    },
    {
      id: '5',
      question: '데이터는 안전하게 보관되나요?',
      answer: '모든 데이터는 암호화되어 안전하게 저장되며, 개인정보 보호 정책에 따라 철저하게 관리됩니다.'
    }
  ]);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-6">자주 묻는 질문</h2>
      
      <div className="space-y-4">
        {faqs.map(faq => (
          <div key={faq.id} className="border-b border-gray-100 last:border-0">
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full py-4 flex justify-between items-center text-left"
            >
              <span className="font-medium">{faq.question}</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  openItem === faq.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {openItem === faq.id && (
              <div className="pb-4 text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
