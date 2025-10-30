#!/usr/bin/env python3
"""
영양소별 평균 섭취량 데이터를 데이터베이스에 삽입하는 스크립트
Excel 파일을 읽어서 average_nutrition 테이블에 데이터를 삽입합니다.
"""

import pandas as pd
import os
from datetime import datetime
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
# database.py의 Database 클래스를 사용
from database import Database

def get_db():
    """데이터베이스 인스턴스 반환"""
    try:
        print("🔌 데이터베이스 인스턴스 생성...")
        db = Database()
        print("✅ 데이터베이스 인스턴스 생성 성공")
        return db
    except Exception as e:
        print(f"❌ 데이터베이스 인스턴스 생성 실패: {e}")
        return None

def create_table_if_not_exists(db):
    """average_nutrition 테이블이 없으면 생성"""
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS average_nutrition (
                        id SERIAL PRIMARY KEY,
                        nutrient_name VARCHAR(50) NOT NULL,
                        unit VARCHAR(20) NOT NULL,
                        age_group VARCHAR(20) NOT NULL,
                        average_value DECIMAL(10,2) NOT NULL,
                        standard_error DECIMAL(10,2),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(nutrient_name, age_group)
                    );
                """)
                conn.commit()
                print("✅ average_nutrition 테이블 확인/생성 완료")
    except Exception as e:
        print(f"❌ 테이블 생성 실패: {e}")
        raise

def parse_nutrient_name(nutrient_str):
    """영양소명에서 영양소명과 단위를 분리"""
    # 예: "에너지 섭취량(kcal)" -> ("에너지 섭취량", "kcal")
    if '(' in nutrient_str and ')' in nutrient_str:
        name = nutrient_str.split('(')[0].strip()
        unit = nutrient_str.split('(')[1].split(')')[0].strip()
        return name, unit
    else:
        return nutrient_str, ""

def process_excel_data(file_path):
    """Excel 파일을 읽어서 데이터베이스 삽입용 데이터로 변환"""
    try:
        # Excel 파일 읽기
        df = pd.read_excel(file_path)
        print(f"📊 Excel 파일 읽기 완료: {df.shape[0]}개 영양소, {df.shape[1]}개 컬럼")
        
        # 영양소명 컬럼 확인
        nutrient_col = '영양소＼연령(세)'
        if nutrient_col not in df.columns:
            print(f"❌ 영양소 컬럼을 찾을 수 없습니다: {nutrient_col}")
            return []
        
        # 연령대별 컬럼 매핑
        age_groups = {
            '전체': '전체',
            '1-2': '1-2세',
            '3-5': '3-5세', 
            '6-11': '6-11세',
            '12-18': '12-18세',
            '19-29': '19-29세',
            '30-49': '30-49세',
            '50-64': '50-64세',
            '≥ 65': '65세 이상'
        }
        
        data_to_insert = []
        
        for idx, row in df.iterrows():
            nutrient_str = row[nutrient_col]
            if pd.isna(nutrient_str):
                continue
                
            # 영양소명과 단위 분리
            nutrient_name, unit = parse_nutrient_name(nutrient_str)
            
            # 각 연령대별 데이터 처리
            for age_key, age_group in age_groups.items():
                avg_col = f"{age_key} 평균"
                std_col = f"{age_key} 표준오차"
                
                if avg_col in df.columns:
                    avg_value = row[avg_col]
                    std_value = row[std_col] if std_col in df.columns else None
                    
                    # NaN 값 체크
                    if pd.notna(avg_value):
                        data_to_insert.append({
                            'nutrient_name': nutrient_name,
                            'unit': unit,
                            'age_group': age_group,
                            'average_value': float(avg_value),
                            'standard_error': float(std_value) if pd.notna(std_value) else None
                        })
        
        print(f"📝 처리된 데이터: {len(data_to_insert)}개 레코드")
        return data_to_insert
        
    except Exception as e:
        print(f"❌ Excel 파일 처리 실패: {e}")
        return []

def insert_data_to_db(db, data_list):
    """데이터베이스에 데이터 삽입"""
    if not data_list:
        print("⚠️ 삽입할 데이터가 없습니다.")
        return
    
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                # 기존 데이터 삭제 (선택사항)
                cursor.execute("DELETE FROM average_nutrition")
                print("🗑️ 기존 데이터 삭제 완료")
                
                # 데이터 삽입
                insert_query = """
                    INSERT INTO average_nutrition 
                    (nutrient_name, unit, age_group, average_value, standard_error)
                    VALUES (%(nutrient_name)s, %(unit)s, %(age_group)s, %(average_value)s, %(standard_error)s)
                    ON CONFLICT (nutrient_name, age_group) 
                    DO UPDATE SET
                        unit = EXCLUDED.unit,
                        average_value = EXCLUDED.average_value,
                        standard_error = EXCLUDED.standard_error,
                        created_at = CURRENT_TIMESTAMP
                """
                
                cursor.executemany(insert_query, data_list)
                conn.commit()
                
                print(f"✅ 데이터 삽입 완료: {len(data_list)}개 레코드")
                
                # 삽입된 데이터 확인
                cursor.execute("SELECT COUNT(*) FROM average_nutrition")
                count = cursor.fetchone()[0]
                print(f"📊 현재 테이블 총 레코드 수: {count}개")
                
    except Exception as e:
        print(f"❌ 데이터 삽입 실패: {e}")
        raise

def main():
    """메인 실행 함수"""
    print("🚀 영양소별 평균 섭취량 데이터 삽입 시작")
    
    # Excel 파일 경로
    excel_file = "영양소별 평균 섭취량 - 연령층별(전체) (1).xlsx"
    
    if not os.path.exists(excel_file):
        print(f"❌ Excel 파일을 찾을 수 없습니다: {excel_file}")
        sys.exit(1)
    
    # 데이터베이스 인스턴스 생성
    db = get_db()
    if not db:
        sys.exit(1)
    
    try:
        # 테이블 생성
        create_table_if_not_exists(db)
        
        # Excel 데이터 처리
        data_list = process_excel_data(excel_file)
        
        if data_list:
            # 데이터베이스에 삽입
            insert_data_to_db(db, data_list)
            print("🎉 데이터 삽입 완료!")
        else:
            print("⚠️ 처리할 데이터가 없습니다.")
            
    except Exception as e:
        print(f"❌ 실행 중 오류 발생: {e}")
    finally:
        print("🔌 데이터베이스 작업 완료")

if __name__ == "__main__":
    main()
