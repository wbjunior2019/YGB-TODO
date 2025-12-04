# YGB-TODO

Firebase Realtime Database를 사용한 할일 관리 웹 애플리케이션

## 기능

- ✅ 할일 추가
- ✏️ 할일 수정
- 🗑️ 할일 삭제
- ✅ 완료 상태 토글
- 📊 실시간 동기화 (Firebase Realtime Database)

## 기술 스택

- HTML5
- CSS3
- JavaScript (ES6 Modules)
- Firebase Realtime Database

## 설정 방법

### 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. **Realtime Database** 활성화
4. 프로젝트 설정에서 웹 앱 구성 정보 복사

### 2. Firebase 설정 적용

`script.js` 파일의 `firebaseConfig` 객체에 Firebase 설정 정보를 입력하세요:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Realtime Database 보안 규칙 설정

Firebase Console → Realtime Database → Rules 탭에서 다음 규칙을 설정:

```json
{
  "rules": {
    "todos": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **주의**: 프로덕션 환경에서는 인증 규칙을 사용하세요!

### 4. 실행

1. 로컬 서버 실행:
   ```bash
   python3 -m http.server 8000
   ```
   또는
   ```bash
   npx serve
   ```

2. 브라우저에서 `http://localhost:8000` 접속

## 파일 구조

```
todo-firebase/
├── index.html      # HTML 구조
├── style.css       # 스타일시트
├── script.js       # JavaScript 로직 및 Firebase 연동
└── README.md       # 프로젝트 설명서
```

## 데이터 구조

Realtime Database에 다음과 같이 저장됩니다:

```
todos/
  - {auto-generated-id}/
    - text: "할일 내용"
    - completed: false
    - createdAt: "2024-01-01T00:00:00.000Z"
```

## 라이선스

MIT License

