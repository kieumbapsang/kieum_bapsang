#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV 파일 인코딩 변환 및 컬럼 분석
"""

import pandas as pd
import os

def detect_encoding(file_path):
    """파일 인코딩 감지"""
    # 일반적인 한국어 인코딩들 시도
    encodings = ['utf-8', 'cp949', 'euc-kr', 'latin1']
    return encodings

def convert_and_analyze_csv():
    """CSV 파일 변환 및 분석"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(base_dir, "전국아동복지급식정보표준데이터.csv")
    output_file = os.path.join(base_dir, "전국아동복지급식정보표준데이터_utf8.csv")

    
    # 인코딩 목록
    encodings = detect_encoding(input_file)
    
    for encoding in encodings:
        try:
            print(f"\n{encoding} 인코딩으로 시도...")
            # CSV 파일 읽기
            df = pd.read_csv(input_file, encoding=encoding)
            
            print("=== CSV 파일 정보 ===")
            print(f"행 수: {len(df)}")
            print(f"열 수: {len(df.columns)}")
            
            print("\n=== 컬럼 정보 ===")
            for i, col in enumerate(df.columns):
                print(f"{i+1:2d}. {col}")
            
            print("\n=== 첫 5행 데이터 ===")
            print(df.head())
            
            print("\n=== 데이터 타입 ===")
            print(df.dtypes)
            
            print("\n=== 결측값 확인 ===")
            print(df.isnull().sum())
            
            # UTF-8 인코딩으로 새로운 CSV 파일 저장
            print(f"\n=== UTF-8 인코딩으로 새 파일 저장 중... ===")
            df.to_csv(output_file, encoding='utf-8', index=False)
            print(f"✅ 새 파일 저장 완료: {output_file}")
            
            # 저장된 파일 확인
            print(f"\n=== 저장된 파일 확인 ===")
            df_check = pd.read_csv(output_file, encoding='utf-8')
            print(f"저장된 파일 행 수: {len(df_check)}")
            print(f"저장된 파일 열 수: {len(df_check.columns)}")
            print("저장된 파일 첫 3행:")
            print(df_check.head(3))
            
            return df
            
        except Exception as e:
            print(f"{encoding} 인코딩 실패: {e}")
            continue
    
    print("모든 인코딩 시도 실패")
    return None

if __name__ == "__main__":
    convert_and_analyze_csv()
