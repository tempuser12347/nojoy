# dho joy 오프라인

dho joy 에 올라간 정보를 오프라인으로 서버를 직접 띄워서 사용하는 프로그램

> [!CAUTION]
> dho joy 의 모든 데이터를 수집하지 못하여 모든 정보를 검색할 수는 없습니다. 현재 퀘스트,발견물,도시,침몰선,보물지도,선박 탭만 구현이 되어 있습니다. 이마저도 아직 joy 처럼 다른 테이블에 있는 데이터를 다 긁어와서 추가정보를 종합하여 보여주는 방식은 아닙니다. 초기베타버전이라고 생각해주세요

## 설치 및 사용

:warning: python 설치 부분은 매우 대충 넘어감

윈도우11 환경

### python 설치

https://www.python.org/downloads/windows/ 에서 윈도우 설치 파일 받아서 설치



### python 필수 패키지 설치

powershell 열어서 작업

```
cd backend
pip install -r requirements.txt
```


### 서버 실행

```
cd backend
python run.py
```

`http://localhost:8000` 으로 가면 서버 웹페이지 접근 가능


## 데이터베이스

기본이 되는 데이터를 이미 작업해준 https://github.com/dhosql/dhoSQL 에서 가져온 db를 활용하였습다다.

가져온 db에서 한글 column 을 영어로 바꾸는 작업, 추가 table 대충이라도 생성하는 등의 수정을 가했습니다.

db 파일은 `dhoDatabase.sqlite3` 파일입니다.
