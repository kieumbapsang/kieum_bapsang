"""
키움밥상 OCR API 애플리케이션
FastAPI 기반의 OCR 서비스
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import config
from api_routes import router

def create_app() -> FastAPI:
    """FastAPI 애플리케이션 생성"""
    app = FastAPI(
        title=config.API_TITLE,
        version=config.API_VERSION,
        description=config.API_DESCRIPTION
    )
    
    # CORS 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 라우터 등록
    app.include_router(router)
    
    return app

# 애플리케이션 인스턴스 생성
app = create_app()
