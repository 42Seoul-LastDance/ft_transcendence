# Web Service

> Real-time Multiplayer Pong Game with Chat, OAuth

<br/><br/>

<img width="1626" alt="Screen Shot 2023-11-03 at 6 29 10 PM" src="https://github.com/42Seoul-LastDance/ft_transcendence/assets/87380790/c7b8889d-083b-4045-adb1-0460844dd72c">

<br/><br/>

### 깃 브랜치
Git Flow에서는 총 5개의 브랜치를 사용합니다. 각 브랜치에 대해 간단하게 알아보도록 하겠습니다.

- `master` <br>
실제 프로덕트로 배포하는 브랜치
master에 머지가 된다는 것은 프로덕트에 적용하는 것을 의미한다.


- `develop` <br>
master에서 배포가 되었다면, 그다음 버전을 준비하는 브랜치이다.


- `feature` <br>
새 기능을 개발하는 브랜치
develop을 베이스 브랜치로 가지며, 완료되면 develop에 머지하고 릴리즈를 준비한다.
보통 feature는 prefix로 두고, 뒤에 jira 티켓 번호를 붙이거나 기능명을 적는다.
feature/add-read-api-#133
feature-API-133


- `release` <br>
실제 프로덕트로 배포하기 전에, 최종 점검을 하기 위한 브랜치
develop에서 해당 브랜치를 생성하며, 버그가 있을 경우에는 release 브랜치에서 버그를 픽스한다.
보통 release를 prefix로 두고, 뒤에 릴리즈 버전을 명시한다.
release/1.1.0


- `hotfix` <br>
프로덕트에서 예상하지 못했던 버그를 수정하기 위한 브랜치
