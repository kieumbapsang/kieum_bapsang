"""
데이터베이스 연결 및 설정
PostgreSQL 연결을 관리합니다.
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import Generator
from dotenv import load_dotenv

load_dotenv()

class Database:
    """데이터베이스 연결 관리 클래스"""
    
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.database = os.getenv('DB_NAME', 'kiumbapsang')
        self.user = os.getenv('DB_USER', 'postgres')
        self.password = os.getenv('DB_PASSWORD', 'password')
        self.port = os.getenv('DB_PORT', '5432')
    
    def get_connection_string(self) -> str:
        """데이터베이스 연결 문자열 반환"""
        return f"host={self.host} dbname={self.database} user={self.user} password={self.password} port={self.port}"
    
    @contextmanager
    def get_connection(self) -> Generator[psycopg2.extensions.connection, None, None]:
        """데이터베이스 연결 컨텍스트 매니저"""
        conn = None
        try:
            conn = psycopg2.connect(
                host=self.host,
                database=self.database,
                user=self.user,
                password=self.password,
                port=self.port,
                cursor_factory=RealDictCursor
            )
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()
    
    def test_connection(self) -> bool:
        """데이터베이스 연결 테스트"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    return True
        except Exception as e:
            print(f"데이터베이스 연결 실패: {e}")
            return False

# 전역 데이터베이스 인스턴스
db = Database()
