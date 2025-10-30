#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
전국아동복지급식정보표준데이터를 가맹점 테이블에 삽입
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

def get_db_connection():
    """PostgreSQL 데이터베이스 연결"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'kiumbapsang'),
        user=os.getenv('DB_USER', 'kiumbapsang'),
        password=os.getenv('DB_PASSWORD', '1234'),
        port=os.getenv('DB_PORT', '5432')
    )

def clean_data(df):
    """데이터 정리 (10개 컬럼만)"""
    # 결측값 처리
    df['소재지도로명주소'] = df['소재지도로명주소'].fillna('')
    df['소재지지번주소'] = df['소재지지번주소'].fillna('')
    df['전화번호'] = df['전화번호'].fillna('')
    
    # 전화번호 정리 (0000-0000 제거)
    df['전화번호'] = df['전화번호'].replace('02-0000-0000', '')
    
    return df

def insert_store_data():
    """가맹점 데이터 삽입"""
    
    # CSV 파일 읽기
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(base_dir, "전국아동복지급식정보표준데이터_utf8.csv") 
    
    df = pd.read_csv(input_file, encoding='utf-8') 
    # df = pd.read_csv("전국아동복지급식정보표준데이터.csv", encoding='cp949')
    
    print(f"원본 데이터: {len(df)}개 행")
    
    # 데이터 정리
    df = clean_data(df)
    
    # 중복 제거 (가맹점명, 주소 기준)
    df_unique = df.drop_duplicates(subset=['가맹점명', '소재지도로명주소'], keep='first')
    print(f"중복 제거 후: {len(df_unique)}개 행")
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 기존 데이터 삭제
        cursor.execute("DELETE FROM stores")
        print("🗑️ 기존 가맹점 데이터 삭제 완료")
        
        # 데이터 변환 및 삽입 (CSV의 10개 컬럼만)
        insert_data = []
        
        for _, row in df_unique.iterrows():
            # CSV의 10개 컬럼을 그대로 사용
            store_data = (
                row['가맹점명'],                    # 1. 가맹점명
                int(row['가맹점유형코드']),          # 2. 가맹점유형코드
                row['시도명'],                      # 3. 시도명
                row['시군구명'],                    # 4. 시군구명
                int(row['시군구코드']),             # 5. 시군구코드
                row['소재지도로명주소'],             # 6. 소재지도로명주소
                row['소재지지번주소'],              # 7. 소재지지번주소
                float(row['위도']),                 # 8. 위도
                float(row['경도']),                 # 9. 경도
                row['전화번호']                     # 10. 전화번호
            )
            insert_data.append(store_data)
        
        # 배치 삽입
        if insert_data:
            execute_values(
                cursor,
                """
                INSERT INTO stores (
                    store_name, store_type_code, province, city, city_code,
                    road_address, jibun_address, latitude, longitude, phone_number
                ) VALUES %s
                """,
                insert_data
            )
            
            conn.commit()
            print(f"✅ {len(insert_data)}개의 가맹점 데이터가 삽입되었습니다.")
        
        # 삽입된 데이터 확인
        cursor.execute("""
            SELECT 
                province, 
                city, 
                COUNT(*) as store_count
            FROM stores 
            GROUP BY province, city 
            ORDER BY store_count DESC 
            LIMIT 10
        """)
        
        results = cursor.fetchall()
        print("\n=== 지역별 가맹점 수 (상위 10개) ===")
        for row in results:
            print(f"{row[0]} {row[1]}: {row[2]}개")
        
        # 전체 통계
        cursor.execute("SELECT COUNT(*) FROM stores")
        total_count = cursor.fetchone()[0]
        print(f"\n총 가맹점 수: {total_count}개")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🚀 가맹점 데이터를 삽입합니다...")
    insert_store_data()
