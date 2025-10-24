# dho joy 오프라인

dho joy 에 올라간 정보를 오프라인으로 서버를 직접 띄워서 사용하는 프로그램

**스크린샷**

![](docs/스크린샷%202025-10-02%20오전%209.44.04.png)
![](docs/스크린샷%202025-10-02%20오전%209.44.17.png)

> [!CAUTION]
> dho joy 의 모든 데이터를 수집하지 못하여 모든 정보를 검색할 수는 없습니다. 현재 퀘스트,발견물,도시,침몰선,보물지도,선박 탭만 구현이 되어 있습니다. 이마저도 아직 joy 처럼 다른 테이블에 있는 데이터를 다 긁어와서 추가정보를 종합하여 보여주는 방식은 아닙니다. 초기베타버전이라고 생각해주세요

## 설치 및 사용

:warning: python 설치 부분은 매우 대충 넘어감

윈도우11 환경 가정

### 1. python 설치

https://www.python.org/downloads/windows/ 에서 윈도우 설치 파일 받아서 설치

![](docs/pythonsite.png)

꼭 스샷 처럼 3.13.7 일 필요 없습니다. 링크 들어가셨을 때 보이는 최신 버전의 windows installer 다운받아서 설치하시면 됩니다.


#### 1.1 (선택) 파이썬 설치 후 실행 되는지 확인

윈도우 powershell을 열어서 python을 입력해서 실행해봅니다
아래와 같이 보인다면 python 이 설치가 되고 powershell/cmd 에서 실행이 가능하다는 것입니다.

![](docs/powershellpython.png)


### 2. 코드 다운로드

git clone 혹은 zip 파일 다운로드.

```
git clone https://github.com/tempuser12347/nojoy
```

OR

zip download url: https://github.com/tempuser12347/nojoy/archive/refs/heads/main.zip

여기에서 zip 파일 다운로드 후 압축을 해제합니다

### 3. `win_run_server.bat` 파일 실행

압축해제된 폴더에서 `win_run_server.bat` 파일을 실행합니다.
python이 설치가 되었다면 이 스크립트로 필요한 파이썬 패키지를 설치하고 nojoy 서버를 실행하는 작업을 합니다.

![](docs/win1.png)
![](docs/win2.png)

기본적으로 8000번 포트에 실행됩니다.

브라우저를 켜고 [`http://localhost:8000`](http://localhost:8000) 으로 가면 사용 가능합니다.

----

## 데이터베이스

초기 기본이 되는 데이터를 이미 작업해준 https://github.com/dhosql/dhoSQL 에서 가져온 db를 활용하였습다다.

이후에 dhodb.com, ssjoy 크롤링하여 데이터를 지속적으로 추가하였고 초기버전에 비해 많은 데이터들이 추가되었습니다. 크롤링 하면서 각 메뉴별로 소수의 데이터 누락이 있을 수도 있습니다만 적을 것이라고 생각합니다. 최신 데이터의 경우 누락이 되었을 수 있습니다. 잘못된 데이터나 신규 데이터 추가가 필요하다면 [issue 등록](https://github.com/tempuser12347/nojoy/issues/new/choose)해주세요!

기본적으로 ssjoy의 id 체계를 따라하는 것을 원칙으로 하고 있기에 ssjoy/dhodb에 변경할 데이터 페이지가 있어야 합니다. ssjoy, dhodb 에 아직 등록되지 않은 데이터는 ssjoy,dhodb에 등록되면 반영할 생각입니다.

해당 레포에서 사용되는 db 파일은 `dhoDatabase.sqlite3` 파일입니다.

추천 db browser
- DB Browser for SQLite: https://sqlitebrowser.org/ 개발시 설치해서 db 조회, 수정 할 때 유용
- https://inloop.github.io/sqlite-viewer/ : 온라인으로 빠르게 데이터 확인해보고자 할 시 유용


