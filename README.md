# Main

### 사용법
0. [중요] git clone [url] ~/Desktop/transcendence
1. make docker -> init_docker.sh 스크립트 실행 후 Docker Desktop 실행
2. Docker Desktop 실행될 때까지 기다리기
2. make -> typescript 컴파일 엔진 구동
3. srcs 폴더에서 작업 (볼륨 연결 되어있음)
4. make compile -> srcs 폴더 하위에 있는 모든 .ts 파일 컴파일 -> .js로 바뀜
5. 웹 브라우저에서 index.html 열기
