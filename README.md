# 독서기록

다 읽은 책을 책등으로 책장에 꽂고, 달력에는 표지로 보여 주는 웹앱이에요.
책 제목을 입력하면 카카오(Daum) 책 검색에서 책을 찾아 제목, 저자, 표지를 채우고,
쪽수는 Google Books에서 ISBN으로 찾아 채워요.

## 구조

- `public/` 앱 화면 (정적 파일)
- `api/search.js` 제목으로 카카오 책 검색
- `api/book.js` ISBN으로 Google Books에서 쪽수 조회
- `api/cover.js` 표지 이미지를 서버가 대신 가져옴 (카카오/다음 이미지 서버만 허용)
- `local.js` 내 컴퓨터에서 실행하는 간단한 서버

API 키는 서버(`api/`)에서만 쓰여서 화면 코드에 노출되지 않아요.

## 1. 카카오 REST API 키 받기

1. developers.kakao.com에 카카오 계정으로 로그인해요.
2. **내 애플리케이션 → 애플리케이션 추가하기**로 앱을 하나 만들어요. 이름은 아무거나 괜찮아요.
3. 앱 설정의 **앱 키**에서 **REST API 키**를 복사해요.
4. 책 검색(Daum 검색 API)이 막혀 있으면 앱 설정에서 해당 API 사용 설정이 켜져 있는지 확인해요.

Google Books는 키 없이도 동작해요. 호출이 몰려 제한에 걸리면 Google Cloud에서 Books API 키를 만들어 `GOOGLE_BOOKS_API_KEY`로 넣을 수 있어요. 필수는 아니에요.

## 2. Vercel에 올리기 (폰에서 쓰는 방법)

1. 이 폴더를 GitHub 저장소로 올려요.
2. vercel.com에 GitHub 계정으로 로그인하고 **Add New → Project**에서 그 저장소를 가져와요.
3. 설정 화면의 **Environment Variables**에 이름 `KAKAO_REST_API_KEY`, 값에 REST API 키를 넣고 **Deploy**를 눌러요.
4. 배포가 끝나면 나오는 주소를 폰 브라우저에서 열어요.
   - iPhone: Safari 공유 버튼 → **홈 화면에 추가**
   - Android: Chrome 메뉴 → **홈 화면에 추가**

키를 바꾸거나 나중에 넣을 때는 Vercel 프로젝트의 Settings → Environment Variables에서 수정하고 다시 배포해요.

## 3. 내 컴퓨터에서 실행하기

Node.js 18 이상이 필요해요.

```
KAKAO_REST_API_KEY=발급받은키 node local.js
```

그다음 브라우저에서 http://localhost:3000 을 열어요. (Windows PowerShell: `$env:KAKAO_REST_API_KEY="발급받은키"; node local.js`)

## 알아 둘 점

- 카카오 책 검색은 쪽수를 주지 않아요. 쪽수는 Google Books에서 찾는데, 한국 책은 쪽수가 비어 있거나 판본이 달라 틀릴 수 있어요. 비어 있으면 직접 입력하세요.
- 카카오 검색에 없는 책은 찾을 수 없어요. 그때는 제목, 저자, 표지 사진을 직접 입력하면 돼요.

## 저장 방식과 백업

기록은 **쓰는 기기의 브라우저**에 저장돼요. 폰과 컴퓨터는 서로 이어지지 않아요.
기기를 옮기거나 브라우저 데이터를 지울 때를 대비해 화면 맨 아래의 **백업 내려받기**로 파일을 받아 두고,
새 기기에서는 **백업 불러오기**로 복원해요. 홈 화면에 추가해서 쓰면 기록이 더 오래 유지돼요.

## 출처

도서 정보: 카카오(Daum) 책 검색, Google Books
