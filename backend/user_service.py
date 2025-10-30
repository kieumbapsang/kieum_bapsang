"""
사용자 프로필 관련 비즈니스 로직
"""
from datetime import datetime, date
from typing import Optional
from database import db
from user_models import UserProfile, UserProfileCreate, UserProfileUpdate
import psycopg2

class UserService:
    """사용자 서비스 클래스"""
    
    def __init__(self):
        self.db = db
    
    def create_user_profile(self, profile_data: UserProfileCreate) -> UserProfile:
        """사용자 프로필 생성"""
        try:
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO user_profiles (
                            google_id, email, username, age, birth, height, weight, 
                            address, protector_name, protector_phone, protector_relationship
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                        ) RETURNING id, created_at, updated_at
                    """, (
                        profile_data.google_id,
                        profile_data.email,
                        profile_data.username,
                        profile_data.age,
                        profile_data.birth,
                        profile_data.height,
                        profile_data.weight,
                        profile_data.address,
                        profile_data.protector_name,
                        profile_data.protector_phone,
                        profile_data.protector_relationship
                    ))
                    
                    result = cursor.fetchone()
                    profile_id = result['id']
                    created_at = result['created_at']
                    updated_at = result['updated_at']
                    
                    conn.commit()
                    
                    return UserProfile(
                        id=profile_id,
                        google_id=profile_data.google_id,
                        email=profile_data.email,
                        username=profile_data.username,
                        age=profile_data.age,
                        birth=profile_data.birth,
                        height=profile_data.height,
                        weight=profile_data.weight,
                        address=profile_data.address,
                        protector_name=profile_data.protector_name,
                        protector_phone=profile_data.protector_phone,
                        protector_relationship=profile_data.protector_relationship,
                        created_at=created_at,
                        updated_at=updated_at
                    )
        except Exception as e:
            raise Exception(f"사용자 프로필 생성 실패: {str(e)}")
    
    def get_user_profile_by_google_id(self, google_id: str) -> Optional[UserProfile]:
        """구글 ID로 사용자 프로필 조회"""
        try:
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT id, google_id, email, username, age, birth, height, weight,
                               address, protector_name, protector_phone, protector_relationship,
                               created_at, updated_at
                        FROM user_profiles 
                        WHERE google_id = %s
                    """, (google_id,))
                    
                    result = cursor.fetchone()
                    if not result:
                        return None
                    
                    return UserProfile(
                        id=result['id'],
                        google_id=result['google_id'],
                        email=result['email'],
                        username=result['username'],
                        age=result['age'],
                        birth=result['birth'],
                        height=result['height'],
                        weight=result['weight'],
                        address=result['address'],
                        protector_name=result['protector_name'],
                        protector_phone=result['protector_phone'],
                        protector_relationship=result['protector_relationship'],
                        created_at=result['created_at'],
                        updated_at=result['updated_at']
                    )
        except Exception as e:
            raise Exception(f"사용자 프로필 조회 실패: {str(e)}")
    
    def get_user_profile_by_id(self, user_id: int) -> Optional[UserProfile]:
        """ID로 사용자 프로필 조회"""
        try:
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT id, google_id, email, username, age, birth, height, weight,
                               address, protector_name, protector_phone, protector_relationship,
                               created_at, updated_at
                        FROM user_profiles 
                        WHERE id = %s
                    """, (user_id,))
                    
                    result = cursor.fetchone()
                    if not result:
                        return None
                    
                    return UserProfile(
                        id=result['id'],
                        google_id=result['google_id'],
                        email=result['email'],
                        username=result['username'],
                        age=result['age'],
                        birth=result['birth'],
                        height=result['height'],
                        weight=result['weight'],
                        address=result['address'],
                        protector_name=result['protector_name'],
                        protector_phone=result['protector_phone'],
                        protector_relationship=result['protector_relationship'],
                        created_at=result['created_at'],
                        updated_at=result['updated_at']
                    )
        except Exception as e:
            raise Exception(f"사용자 프로필 조회 실패: {str(e)}")
    
    def update_user_profile(self, user_id: int, profile_data: UserProfileUpdate) -> UserProfile:
        """사용자 프로필 수정"""
        try:
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    # 업데이트할 필드들 동적 생성
                    update_fields = []
                    values = []
                    
                    if profile_data.username is not None:
                        update_fields.append("username = %s")
                        values.append(profile_data.username)
                    
                    if profile_data.age is not None:
                        update_fields.append("age = %s")
                        values.append(profile_data.age)
                    
                    if profile_data.birth is not None:
                        update_fields.append("birth = %s")
                        values.append(profile_data.birth)
                    
                    if profile_data.height is not None:
                        update_fields.append("height = %s")
                        values.append(profile_data.height)
                    
                    if profile_data.weight is not None:
                        update_fields.append("weight = %s")
                        values.append(profile_data.weight)
                    
                    if profile_data.address is not None:
                        update_fields.append("address = %s")
                        values.append(profile_data.address)
                    
                    if profile_data.protector_name is not None:
                        update_fields.append("protector_name = %s")
                        values.append(profile_data.protector_name)
                    
                    if profile_data.protector_phone is not None:
                        update_fields.append("protector_phone = %s")
                        values.append(profile_data.protector_phone)
                    
                    if profile_data.protector_relationship is not None:
                        update_fields.append("protector_relationship = %s")
                        values.append(profile_data.protector_relationship)
                    
                    if not update_fields:
                        raise Exception("수정할 필드가 없습니다")
                    
                    # updated_at 필드 추가
                    update_fields.append("updated_at = CURRENT_TIMESTAMP")
                    values.append(user_id)
                    
                    cursor.execute(f"""
                        UPDATE user_profiles 
                        SET {', '.join(update_fields)}
                        WHERE id = %s
                    """, values)
                    
                    conn.commit()
                    
                    # 수정된 프로필 조회
                    return self.get_user_profile_by_id(user_id)
        except Exception as e:
            raise Exception(f"사용자 프로필 수정 실패: {str(e)}")
    
    def delete_user_profile(self, user_id: int) -> bool:
        """사용자 프로필 삭제"""
        try:
            with self.db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("DELETE FROM user_profiles WHERE id = %s", (user_id,))
                    
                    if cursor.rowcount == 0:
                        raise Exception("삭제할 사용자 프로필을 찾을 수 없습니다")
                    
                    conn.commit()
                    return True
        except Exception as e:
            raise Exception(f"사용자 프로필 삭제 실패: {str(e)}")

# 전역 서비스 인스턴스
user_service = UserService()

