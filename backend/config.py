"""
설정 관리 모듈
환경 변수와 애플리케이션 설정을 관리합니다.
"""

import os
from dotenv import load_dotenv
from typing import List

# 환경 변수 로드
load_dotenv()

class Config:
    """애플리케이션 설정 클래스"""
    
    # 네이버 클로바 OCR API 설정
    CLOVA_OCR_API_URL = os.getenv("CLOVA_OCR_API_URL", "https://your-api-url.apigw.ntruss.com/ocr/v1/general")
    CLOVA_OCR_SECRET_KEY = os.getenv("CLOVA_OCR_SECRET_KEY", "your-secret-key-here")
    
    # 서버 설정
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS 설정
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # API 설정
    API_TITLE = "키움밥상 OCR API"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "네이버 클로바 OCR을 사용한 영양성분표 인식 서비스"
    
    @classmethod
    def is_api_configured(cls) -> bool:
        """API가 올바르게 설정되었는지 확인"""
        return (
            cls.CLOVA_OCR_API_URL != "https://your-api-url.apigw.ntruss.com/ocr/v1/general" and
            cls.CLOVA_OCR_SECRET_KEY != "your-secret-key-here"
        )
    
    @classmethod
    def get_cors_origins(cls) -> List[str]:
        """CORS 허용 오리진 반환"""
        if cls.ALLOWED_ORIGINS == ["*"]:
            return ["*"]
        return [origin.strip() for origin in cls.ALLOWED_ORIGINS if origin.strip()]

# 전역 설정 인스턴스
config = Config()