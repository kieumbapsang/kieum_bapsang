"""
사용자 프로필 관련 모델
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class UserProfileCreate(BaseModel):
    """사용자 프로필 생성 모델"""
    google_id: str
    email: str
    username: str
    age: int
    birth: date
    height: float
    weight: float
    address: str
    protector_name: Optional[str] = None
    protector_phone: Optional[str] = None
    protector_relationship: Optional[str] = None

class UserProfileUpdate(BaseModel):
    """사용자 프로필 수정 모델"""
    username: Optional[str] = None
    age: Optional[int] = None
    birth: Optional[date] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    address: Optional[str] = None
    protector_name: Optional[str] = None
    protector_phone: Optional[str] = None
    protector_relationship: Optional[str] = None

class UserProfile(BaseModel):
    """사용자 프로필 응답 모델"""
    id: int
    google_id: str
    email: str
    username: str
    age: int
    birth: date
    height: float
    weight: float
    address: str
    protector_name: Optional[str] = None
    protector_phone: Optional[str] = None
    protector_relationship: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class GoogleAuthRequest(BaseModel):
    """구글 인증 요청 모델"""
    credential: str
    email: str
    name: str
    google_id: str

