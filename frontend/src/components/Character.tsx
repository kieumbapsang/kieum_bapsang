import React from 'react';

export interface CharacterProps {
  name: "kkumi" | "ttoto" | "mongmong" | "babi" | "rio" | "apple" | "bear" | "bunny" | "carrot" | "placeholder1" | "placeholder2" | "placeholder3";
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const characterData = {
  kkumi: {
    name: "꾸미",
    emoji: "🐰",
    color: "from-orange-400 to-lime-400",
    bgColor: "from-orange-50 to-lime-50",
  },
  ttoto: {
    name: "또또",
    emoji: "🐰",
    color: "from-yellow-400 to-sky-400",
    bgColor: "from-yellow-50 to-sky-50",
  },
  mongmong: {
    name: "몽몽",
    emoji: "🐰",
    color: "from-pink-400 to-lime-400",
    bgColor: "from-pink-50 to-lime-50",
  },
  babi: {
    name: "밥이",
    emoji: "🐰",
    color: "from-amber-300 to-orange-200",
    bgColor: "from-amber-50 to-orange-50",
  },
  rio: {
    name: "리오",
    emoji: "🐰",
    color: "from-red-400 to-teal-400",
    bgColor: "from-red-50 to-teal-50",
  },
  apple: {
    name: "사과",
    emoji: "🍎",
    color: "from-red-400 to-orange-400",
    bgColor: "from-red-50 to-orange-50",
  },
  bear: {
    name: "곰",
    emoji: "🐻",
    color: "from-amber-300 to-yellow-300",
    bgColor: "from-amber-50 to-yellow-50",
  },
  bunny: {
    name: "토끼",
    emoji: "🐰",
    color: "from-pink-300 to-green-300",
    bgColor: "from-pink-50 to-green-50",
  },
  carrot: {
    name: "당근",
    emoji: "🥕",
    color: "from-orange-300 to-green-300",
    bgColor: "from-orange-50 to-green-50",
  },
  // 나중에 추가할 캐릭터들을 위한 placeholder
  placeholder1: {
    name: "캐릭터1",
    emoji: "🐰",
    color: "from-green-400 to-teal-400",
    bgColor: "from-green-50 to-teal-50",
  },
  placeholder2: {
    name: "캐릭터2",
    emoji: "🐰",
    color: "from-purple-400 to-pink-400",
    bgColor: "from-purple-50 to-pink-50",
  },
  placeholder3: {
    name: "캐릭터3",
    emoji: "🐰",
    color: "from-blue-400 to-cyan-400",
    bgColor: "from-blue-50 to-cyan-50",
  },
};

export const Character: React.FC<CharacterProps> = ({ 
  name, 
  message, 
  size = "md", 
  className = "" 
}) => {
  const character = characterData[name];
  
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  // 이모지 기반 캐릭터 표시
  const emojiSizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl",
  };

  if (!message) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} character-bounce flex items-center justify-center`}
      >
        <span className={emojiSizeClasses[size]}>{character.emoji}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} flex-shrink-0 character-bounce flex items-center justify-center`}
      >
        <span className={emojiSizeClasses[size]}>{character.emoji}</span>
      </div>
      <div className="flex-1">
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};
