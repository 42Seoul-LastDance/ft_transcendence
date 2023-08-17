# Main

### 사용법

1. 레포 클론

   ```bash
   git clone https://github.com/42Seoul-LastDance/Main.git && cd Main
   ```

2. **[클러스터]** 도커가 꺼져있다면 `make docker` 로 도커 실행
   
3. 도커 실행 후 `make`하여 ts 컴파일 컨테이너 실행
4. srcs 폴더에서 작업 (볼륨 연결 되어있음)
5. `make compile` -> `srcs` 폴더 하위에 있는 모든 `.ts` 파일 컴파일 -> `.js`로 바뀜
6. 웹 브라우저에서 `index.html` 열기
   -  vscode extension -> Live Preview -> Show Preview (External Browser) 로 바로 실행 가능
