# KeplerProject - Vega OS WebView with Kollus Multi-DRM Integration

Vega OS 플랫폼에서 Kollus Multi-DRM을 연동한 WebView 기반 미디어 플레이어 샘플 애플리케이션입니다.

## 프로젝트 개요

이 프로젝트는 Amazon Vega OS 환경에서 WebView를 사용하여 DRM으로 보호된 콘텐츠를 재생하는 TV 애플리케이션입니다. React Native 기반으로 작성되었으며, Kepler 프레임워크를 활용합니다.

## 주요 기능

- **WebView 기반 콘텐츠 재생**: Kollus Multi-DRM으로 보호된 미디어 콘텐츠 재생
- **TV 리모컨 제어**: Vega OS 리모컨의 방향키 및 미디어 키를 통한 플레이어 제어
- **전체화면 지원**: Enter 키를 통한 전체화면 토글
- **미디어 컨트롤**:
  - 재생/일시정지 (PlayPause 버튼)
  - 빨리감기/되감기 (좌/우 방향키, FF/REW 버튼)
  - 볼륨 조절 (상/하 방향키)

## 기술 스택

- **React Native**: 0.72.0
- **React**: 18.2.0
- **Amazon Kepler**: TV 애플리케이션 프레임워크
- **Amazon WebView**: 3.3.x (Vega OS용 WebView 컴포넌트)
- **TypeScript**: 4.8.4

## 프로젝트 구조

```
KeplerProject/
├── src/
│   ├── App.tsx              # 메인 애플리케이션 컴포넌트
│   ├── components/          # UI 컴포넌트
│   │   └── Link.tsx
│   └── assets/             # 이미지 및 리소스
├── test/
│   └── App.spec.tsx        # 테스트 파일
├── app.json                # 앱 메타데이터
├── package.json            # 프로젝트 의존성
├── tsconfig.json           # TypeScript 설정
└── jest.config.json        # 테스트 설정
```

## 설치 및 실행

### 사전 요구사항

- Node.js
- Amazon Kepler CLI
- Vega OS 개발 환경

### 의존성 설치

```bash
npm install
```

### 개발 모드 실행

```bash
npm start
```

### 빌드

**Debug 빌드:**
```bash
npm run build:debug
```

**Release 빌드:**
```bash
npm run build:release
```

**전체 빌드 (Lint + Test + Build):**
```bash
npm run release
```

## 리모컨 키 매핑

| 키 | 키코드 | 기능 |
|---|---|---|
| Enter | 13 | 전체화면 토글 |
| 좌측 방향키 | 37 | 10초 되감기 |
| 상단 방향키 | 38 | 볼륨 +10 |
| 우측 방향키 | 39 | 10초 빨리감기 |
| 하단 방향키 | 40 | 볼륨 -10 |
| PlayPause | 179 | 재생/일시정지 |
| Rewind | 227 | 30초 되감기 |
| Fast Forward | 228 | 30초 빨리감기 |

## 개발 스크립트

- `npm run clean`: 빌드 파일 및 node_modules 삭제
- `npm test`: Jest 테스트 실행
- `npm run test:snapshot`: 스냅샷 테스트 업데이트
- `npm run lint`: ESLint 실행
- `npm run lint:fix`: ESLint 자동 수정

## 주요 의존성

### Runtime Dependencies
- `@amazon-devices/react-native-kepler`: Kepler 플랫폼 통합
- `@amazon-devices/webview`: Vega OS WebView 컴포넌트
- `@amazon-devices/kepler-media-controls`: 미디어 제어 API
- `@amazon-devices/kepler-media-types`: 미디어 타입 정의

### Dev Dependencies
- `@amazon-devices/kepler-cli-platform`: Kepler CLI 도구
- `@testing-library/react-native`: 테스팅 라이브러리
- TypeScript, ESLint, Jest 등

## 라이선스

Private

## 타겟 플랫폼

- Vega OS TV (armv7, aarch64, x86_64)
