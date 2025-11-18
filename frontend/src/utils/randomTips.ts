/**
 * 아동 친화적인 건강 팁 메시지
 */
const healthTips = [
  "오늘도 건강한 하루 보내요! 🌟",
  "물을 많이 마시면 키가 쑥쑥 자라요! 💧",
  "채소를 먹으면 힘이 세져요! 💪",
  "과일은 비타민이 가득해요! 🍎",
  "우유를 마시면 뼈가 튼튼해져요! 🥛",
  "아침밥을 먹으면 머리가 똑똑해져요! 🧠",
  "운동하면 몸이 건강해져요! 🏃‍♂️",
  "일찍 자면 키가 더 잘 자라요! 😴",
  "손을 깨끗이 씻으면 병균이 도망가요! 🧼",
  "친구들과 함께 먹으면 더 맛있어요! 👫",
  "천천히 꼭꼭 씹어 먹어요! 🦷",
  "오늘 먹은 음식을 기록해봐요! 📝",
  "색깔별로 다양한 음식을 먹어봐요! 🌈",
  "달콤한 간식은 조금만 먹어요! 🍪",
  "매일 조금씩 운동해요! ⚽",
  "햇빛을 쬐면 비타민D가 생겨요! ☀️",
  "좋은 자세로 앉으면 키가 더 커 보여요! 🪑",
  "감사하는 마음으로 먹어요! 🙏",
  "새로운 음식도 도전해봐요! 🎯",
  "가족과 함께하는 식사 시간이 최고예요! 👨‍👩‍👧‍👦",
];

/**
 * 계절별 특별 메시지
 */
const getSeasonalTip = (): string => {
  const month = new Date().getMonth() + 1;
  
  if (month >= 3 && month <= 5) {
    // 봄
    return "봄에는 새싹 채소가 맛있어요! 🌱";
  } else if (month >= 6 && month <= 8) {
    // 여름
    return "여름에는 시원한 수박이 최고예요! 🍉";
  } else if (month >= 9 && month <= 11) {
    // 가을
    return "가을에는 달콤한 고구마가 맛있어요! 🍠";
  } else {
    // 겨울
    return "겨울에는 따뜻한 국물이 좋아요! 🍲";
  }
};

/**
 * 시간대별 메시지
 */
const getTimeBasedTip = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) {
    return "좋은 아침이에요! 아침밥 먹었나요? 🌅";
  } else if (hour >= 10 && hour < 12) {
    return "오전 간식 시간이에요! 🍌";
  } else if (hour >= 12 && hour < 14) {
    return "점심 맛있게 드세요! 🍱";
  } else if (hour >= 14 && hour < 17) {
    return "오후 간식으로 과일 어때요? 🍓";
  } else if (hour >= 17 && hour < 20) {
    return "저녁 식사 시간이에요! 🍽️";
  } else if (hour >= 20 && hour < 22) {
    return "오늘 하루도 수고했어요! ⭐";
  } else {
    return "일찍 자고 일찍 일어나요! 🌙";
  }
};

/**
 * 랜덤 팁을 반환하는 함수
 * 30% 확률로 시간대별 메시지
 * 20% 확률로 계절별 메시지
 * 50% 확률로 일반 건강 팁
 */
export const getRandomTip = (): string => {
  const random = Math.random();
  
  if (random < 0.3) {
    // 30% - 시간대별 메시지
    return getTimeBasedTip();
  } else if (random < 0.5) {
    // 20% - 계절별 메시지
    return getSeasonalTip();
  } else {
    // 50% - 일반 건강 팁
    const randomIndex = Math.floor(Math.random() * healthTips.length);
    return healthTips[randomIndex];
  }
};

/**
 * 특정 상황에 맞는 팁 반환
 */
export const getContextualTip = (context: 'meal_added' | 'achievement' | 'login' | 'goal_reached'): string => {
  switch (context) {
    case 'meal_added':
      return "잘했어요! 오늘도 건강한 식사를 했네요! 🎉";
    case 'achievement':
      return "대단해요! 새로운 배지를 획득했어요! 🏆";
    case 'login':
      return "반가워요! 오늘도 건강한 하루 보내요! 👋";
    case 'goal_reached':
      return "목표 달성! 정말 자랑스러워요! 🌟";
    default:
      return getRandomTip();
  }
};

/**
 * 캐릭터별 특별 메시지
 */
export const getCharacterMessage = (characterName: string): string => {
  const messages: Record<string, string[]> = {
    bunny: [
      "토끼처럼 당근을 많이 먹어요! 🥕",
      "깡충깡충 뛰면서 운동해요! 🐰",
      "토끼의 귀처럼 잘 들어요! 👂",
    ],
    bear: [
      "곰처럼 튼튼하게 자라요! 🐻",
      "꿀처럼 달콤한 하루 보내요! 🍯",
      "겨울잠 자기 전에 많이 먹어요! 💤",
    ],
    carrot: [
      "당근은 눈에 좋아요! 👀",
      "주황색 음식은 비타민A가 풍부해요! 🥕",
      "당근처럼 건강하게 자라요! 🌱",
    ],
  };
  
  const characterMessages = messages[characterName] || [];
  if (characterMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * characterMessages.length);
    return characterMessages[randomIndex];
  }
  
  return getRandomTip();
};

