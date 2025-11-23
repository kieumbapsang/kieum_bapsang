"""
나의 배지 관련 비즈니스 로직
식사 데이터를 기반으로 나의 배지를 계산합니다.
"""

from datetime import timedelta
from database import db
from models import BadgeType, MyBadgeCountResponse, MyBadgeResponse

class MyBadgesService:
   """나의 배지 서비스 클래스"""
   
   def __init__(self):
      self.db = db
      
   def get_my_badges(self, user_id: int) -> MyBadgeResponse:
      """보유하고 있는 배지 조회"""
      try:
         with self.db.get_connection() as conn:
            with conn.cursor() as cursor:
               # 식사 목록 조회
               cursor.execute("""
                        SELECT id, user_id, food_name, nutrition_data, intake_date, created_at
                        FROM nutrition_records 
                        WHERE user_id = %s
                        ORDER BY intake_date ASC
                    """, (user_id,))
                    
               meals_data = cursor.fetchall() # 식사 목록 데이터

               if not meals_data:
                  return MyBadgeResponse([])

               # 날짜만 추출
               dates = [row['intake_date'] for row in meals_data]
               dates = sorted(set(dates))  # 중복 제거 및 정렬

               # 연속된 날짜 수 계산
               longest_streak = 1
               current_streak = 1

               for i in range(1, len(dates)):
                  if dates[i] == dates[i - 1] + timedelta(days=1):
                     current_streak += 1
                     longest_streak = max(longest_streak, current_streak)
                  else:
                     current_streak = 1

               badges = [] # 보유하고 있는 배지 목록
               # 연속 기록에 따라 배지 부여
               if longest_streak >= 3:
                  badges.append(BadgeType.THREE_MEALS_A_DAY)
               if longest_streak >= 5:
                  badges.append(BadgeType.FIVE_MEALS_A_DAY)
               if longest_streak >= 7:
                  badges.append(BadgeType.SEVEN_MEALS_A_DAY)
               if longest_streak >= 14:
                  badges.append(BadgeType.FOURTEEN_MEALS_A_DAY)

               # 첫 식사 기록 배지
               if len(dates) >= 1:
                  badges.append(BadgeType.FIRST_MEAL)
               # 총 4개 식사 기록 배지
               if len(dates) >= 4:
                  badges.append(BadgeType.FOUR_MEALS)

               # 식사 시간대별 패턴 배지
               morning_count = 0
               lunch_count = 0
               dinner_count = 0

               for meal in meals_data:
                  if meal['created_at'].hour >= 7 and meal['created_at'].hour < 10: # 아침 시간대 (7시 ~ 10시)
                     morning_count += 1
                  elif meal['created_at'].hour >= 11 and meal['created_at'].hour < 14: # 점심 시간대 (11시 ~ 14시)
                     lunch_count += 1
                  elif meal['created_at'].hour >= 17 and meal['created_at'].hour < 20: # 저녁 시간대 (17시 ~ 20시)
                     dinner_count += 1

               # 아침 패턴 배지
               if morning_count >= 7:
                  badges.append(BadgeType.SEVEN_MORNING_MEALS)
               # 점심 패턴 배지
               if lunch_count >= 7:
                  badges.append(BadgeType.SEVEN_LUNCH_MEALS)
               # 저녁 패턴 배지
               if dinner_count >= 7:
                  badges.append(BadgeType.SEVEN_DINNER_MEALS)

               return MyBadgeResponse(badges=badges)

      except Exception as e:
         raise Exception(f"보유하고 있는 배지 조회 실패: {str(e)}")


   def get_my_badges_count(self, user_id: int) -> any:
      """보유하고 있는 배지 수 조회"""
      return MyBadgeCountResponse(count=len(self.get_my_badges(user_id).badges))

   def get_meal_stats(self, user_id: int) -> dict:
      """식사 통계 조회 (총 기록 수, 연속 일수)"""
      try:
         with self.db.get_connection() as conn:
            with conn.cursor() as cursor:
               # 식사 목록 조회
               cursor.execute("""
                        SELECT id, user_id, food_name, nutrition_data, intake_date, created_at
                        FROM nutrition_records 
                        WHERE user_id = %s
                        ORDER BY intake_date ASC
                    """, (user_id,))
                    
               meals_data = cursor.fetchall() # 식사 목록 데이터

               if not meals_data:
                  return {"total_meals": 0, "consecutive_days": 0}

               # 총 식사 기록 수
               total_meals = len(meals_data)

               # 날짜만 추출
               dates = [row['intake_date'] for row in meals_data]
               dates = sorted(set(dates))  # 중복 제거 및 정렬

               # 연속 일수 계산 (오늘부터 역순으로)
               from datetime import date, timedelta
               today = date.today()
               consecutive_days = 0
               current_date = today
               
               dates_set = set(dates)
               for i in range(365):  # 최대 1년까지 확인
                  if current_date in dates_set:
                     consecutive_days += 1
                  else:
                     break
                  current_date = current_date - timedelta(days=1)

               return {
                  "total_meals": total_meals,
                  "consecutive_days": consecutive_days
               }
      except Exception as e:
         raise Exception(f"식사 통계 조회 실패: {str(e)}")

# 전역 서비스 인스턴스
my_badges_service = MyBadgesService()