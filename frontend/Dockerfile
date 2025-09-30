# Node.js 18 기반 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (빌드에 필요한 dev 의존성 포함)
RUN npm install

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN npm run build

# nginx를 사용한 정적 파일 서빙
FROM nginx:alpine

# 빌드된 파일을 nginx 디렉토리로 복사
COPY --from=0 /app/build /usr/share/nginx/html

# nginx 설정 파일 복사 (필요시)
# COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]