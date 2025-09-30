#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
키움밥상 OCR API 서버 실행 파일
"""

import uvicorn
from config import config

def main():
    """메인 실행 함수"""
    print("🚀 키움밥상 OCR API 서버를 시작합니다...")
    print(f"📱 서버 주소: http://{config.HOST}:{config.PORT}")
    print(f"📖 API 문서: http://{config.HOST}:{config.PORT}/docs")
    print(f"🔑 API 설정 상태: {'✅ 설정됨' if config.is_api_configured() else '⚠️  설정 필요'}")
    
    if not config.is_api_configured():
        print("⚠️  .env 파일에 올바른 API 키를 설정해주세요.")
        print("📝 env_example.txt 파일을 참고하세요.")
    
    # 서버 실행
    uvicorn.run(
        "app:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.DEBUG,
        log_level="info" if config.DEBUG else "warning"
    )

if __name__ == "__main__":
    main()
