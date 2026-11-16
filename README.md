# ft_transcendence

> Real-time Multiplayer Pong Game with Chat, OAuth

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![NextJS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Unity](https://img.shields.io/badge/unity-%23000000.svg?style=for-the-badge&logo=unity&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-990000?logo=webgl&logoColor=white&style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

<br/>

## 1. 프로젝트 설명

실시간 1:1 Pong 게임에 채팅·친구·프로필·42 OAuth 로그인을 결합한 팀 웹 프로젝트다.
브라우저에서 Unity WebGL 게임을 실행하고, 웹 서버와 소켓 서버가 인증·매칭·메시지·경기 결과를 처리한다.

<br/>

## 2. 사용 기술 및 학습 범위

**핵심 CS**: 네트워크·데이터베이스·인증 — 클라이언트·서버의 실시간 이벤트 통신과 상태 동기화, 관계형 데이터 모델링·영속성, OAuth2·JWT와 해시 기반 인증 코드 검증.

| 영역 | 사용 기술 및 학습 내용 |
| --- | --- |
| 프런트엔드 | TypeScript, Next.js 13, React 18, Redux Toolkit, MUI, Tailwind CSS |
| 백엔드 | NestJS 10, TypeORM, PostgreSQL, REST API |
| 실시간 통신 | Socket.IO, namespace·room, 연결·접속 상태 관리 |
| 인증 | 42 OAuth2, Passport, JWT·refresh token, 이메일 2차 인증 |
| 게임 연동 | Unity WebGL 빌드, react-unity-webgl, JavaScript 이벤트 교환 |
| 배포 | Docker, Compose, Bash, 서비스별 볼륨·환경변수 |

<br/>

## 3. 핵심 기술 및 설계

- **웹·게임 연결**: React가 Unity WebGL을 로드한다. Unity에서 발생한 이동·충돌·검증 이벤트를 Socket.IO로 전송하고, 수신한 시작·이동·공 동기화·종료 이벤트를 Unity 객체의 메서드에 전달한다.
- **매칭과 경기 상태**: 서버가 모드별 매칭 대기열·초대·준비 상태·게임 방을 관리한다. 기본·어려움 모드, 득점과 5점 종료, 이탈·연결 해제·비정상 상태에 따른 종료 분기가 있다.
- **게임 검증**: 공·패들의 위치·크기 등을 서버의 기준값과 대조한다. 클라이언트 이벤트를 검증·중계하는 구조이므로 모든 물리를 서버에서 계산하는 모델로 설명하지 않는다.
- **실시간 대화**: 채팅 방의 소유자·운영자·멤버·초대·추방·차단·음소거 상태를 관리한다. 채팅 방 정보는 메모리에 보관하고, DM은 엔티티를 통해 저장·최근 내역을 조회한다.
- **인증과 기록**: OAuth 사용자 정보로 계정을 연결하고 JWT를 발급·갱신한다. 선택한 이메일 2차 인증의 코드를 해시로 저장·검증하며, 경기 결과·경험치·레벨·친구·차단 정보를 DB에서 관리한다.
- **서비스 분리**: Next.js·NestJS·PostgreSQL을 Compose의 별도 서비스로 구성하고, 프런트엔드는 4242·백엔드는 3000 포트를 사용한다.

코드 근거: [Unity 연결](https://github.com/42Seoul-LastDance/ft_transcendence/blob/6e7c616ebb082805cc0e0ef88b102b198559d2f7/srcs/next/src/app/game/game.tsx), [게임 서비스](https://github.com/42Seoul-LastDance/ft_transcendence/blob/6e7c616ebb082805cc0e0ef88b102b198559d2f7/srcs/nest/src/game/game.service.ts), [채팅 서비스](https://github.com/42Seoul-LastDance/ft_transcendence/blob/6e7c616ebb082805cc0e0ef88b102b198559d2f7/srcs/nest/src/socket/chatRoom/chatRoom.service.ts), [인증](https://github.com/42Seoul-LastDance/ft_transcendence/blob/6e7c616ebb082805cc0e0ef88b102b198559d2f7/srcs/nest/src/auth/auth.service.ts), [Compose](https://github.com/42Seoul-LastDance/ft_transcendence/blob/6e7c616ebb082805cc0e0ef88b102b198559d2f7/docker-compose.yml).

<br/>

## 4. 프로그램 실행법

현재 폴더에서는 실행할 수 없다. 별도 작업 위치에 팀 저장소를 내려받고 Docker·Compose가 동작하는 Unix 계열 환경을 준비한다. 이미지가 의존성을 설치하므로 빌드 중 네트워크 연결도 필요하다.

```sh
git clone --recurse-submodules https://github.com/42Seoul-LastDance/ft_transcendence.git
cd ft_transcendence
```

`env` 서브모듈은 별도 저장소다. 해당 저장소에 접근할 수 있어야 하며, 제공된 환경 파일을 사용하거나 동일한 변수 구성을 직접 준비해야 한다.

주요 설정은 다음과 같다.

- DB: `DB_HOST`, `DB_PORT`, `DB_NAME`, `POSTGRES_USER_ID`, `POSTGRES_USER_PASSWORD`, `POSTGRES_PASSWORD`
- OAuth: `FT_CLIENT_ID`, `FT_CLIENT_SECRET`, `FT_CALLBACK`
- JWT: `JWT_SECRET_KEY`, `JWT_2FA_SECRET_KEY`, `JWT_ACCESS_EXPIRATION_TIME`, `JWT_REFRESH_EXPIRATION_TIME`
- 메일: `GMAIL_USER_ID`, `GMAIL_USER_PASSWORD`
- 주소: `NEXT_PUBLIC_BACK_URL`, `FRONT_URL`

```sh
cp env/.env .env
mkdir -p srcs/postgresql
# .env의 계정·키·주소를 실제 환경에 맞게 설정한다.
docker compose up --build
```

프런트엔드는 `http://<호스트 IP>:4242`, API는 `http://<호스트 IP>:3000`이다. 로컬 실행이면 호스트 IP 대신 `localhost`를 사용할 수 있지만, 환경변수와 OAuth에 등록한 콜백 주소도 일치해야 한다.

원본 Makefile의 `make`는 환경 파일 복사, IP 설정 스크립트, `docker-compose`를 사용한다. 위 명령은 설정을 직접 준비하는 실행 경로다. 종료할 때는 `docker compose down`을 사용한다.

<br/>

## 5. 구현 범위

### 웹 서비스와 게임 기능

- 42 OAuth 로그인, 토큰 발급·갱신·로그아웃
- 이메일 코드 기반 2차 인증
- 사용자 프로필·이미지·이름 설정
- 친구 요청·수락·삭제, 차단 목록, 접속 상태
- 공개·비공개·비밀번호 채팅 방과 DM
- 운영 권한 부여, 초대, kick·ban·mute
- 모드별 게임 매칭과 친구 초대 경기
- 준비·시작·득점·종료·이탈 처리, 이모지
- 경기 기록과 경험치·레벨·전적 조회


### 저장소 구성과 확인 범위

- 실행에는 별도 환경 설정·OAuth 앱·메일 인증 정보가 필요하다.
- Dockerfile의 `node:latest`·`postgres:latest`는 버전이 고정되어 있지 않다. 기존 의존성과의 호환성 및 실제 기동은 별도 검증이 필요하다.
- 채팅 방 상태의 재시작 후 복원과 완전한 서버 권한형 게임 물리는 이 구현 범위에 포함하지 않는다.

<br/>

## 6. 완성 스크린샷 / Gif

<br/>

## Login [OAuth]
<img width="600" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/68d4c1d8-4aec-411c-8f2a-a2bc0aa013c9">

<br/><br/>

## Chatting
<img width="300" alt="Screen Shot 2023-11-10 at 3 27 14 PM" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/f9ee4a97-b3c3-4315-beba-46c3a0f85b26">

<br/>

<img width="400" alt="Screen Shot 2023-11-10 at 3 27 41 PM" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/34cb4545-83eb-4923-81e3-04007fbd155c">

<img width="400" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/bba3c245-0300-44a8-b81f-1c34d1eb209a">

<br/><br/>

## Game
<img width="800" alt="Screen Shot 2023-11-10 at 3 28 54 PM" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/2b9a076c-54e9-48f7-a31a-c478f118a73a">

![ezgif com-video-to-gif (4)](https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/866397c7-7aab-45dd-928b-bccf074a5514)

<br/><br/>

## Friend

<img width="400" alt="Screen Shot 2023-11-10 at 3 26 42 PM" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/6d2dfe38-6efe-49dc-a979-34551f2ce17e">
<img width="400" alt="Screen Shot 2023-11-10 at 3 25 46 PM" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/69365572-5334-4a13-a1b9-241821972ea5">


<br/><br/>

## Profile

<img width="600" alt="Screen Shot 2023-11-10 at 3 32 03 PM" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/f61203c3-2cb8-40c3-b1e4-0f7ea2fe8cf9">

<br/><br/>

## Game Socket Communication

<img width="1444" alt="Screen Shot 2023-11-10 at 4 48 57 PM" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/e43fb017-8a8e-4754-98b1-068b6f3f0eac">

