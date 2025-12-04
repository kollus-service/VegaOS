# Vega OS WebView 앱 개발 가이드

## 사전 준비

### Vega OS 공식 문서 참고
- **프로젝트 생성**: https://developer.amazon.com/docs/vega/get-started.html
- **빌드 및 배포**: https://developer.amazon.com/docs/vega/kepler-cli.html
- **WebView API**: https://developer.amazon.com/docs/vega/develop-your-app-with-webview.html

---

## 1. manifest.toml 필수 설정

### DRM 및 미디어 서비스 (비디오 재생 필수)
```toml
[wants]
# WebView 렌더러
[[wants.service]]
id = "com.amazon.webview.renderer_service"

# 미디어 재생
[[wants.service]]
id = "com.amazon.media.server"
[[wants.service]]
id = "com.amazon.mediametrics.service"
[[wants.service]]
id = "com.amazon.mediabuffer.service"
[[wants.service]]
id = "com.amazon.mediatransform.service"

# 오디오
[[wants.service]]
id = "com.amazon.audio.stream"
[[wants.service]]
id = "com.amazon.audio.control"

# DRM (Widevine/PlayReady)
[[wants.service]]
id = "com.amazon.drm.key"
[[wants.service]]
id = "com.amazon.drm.crypto"

[[needs.privilege]]
id = "com.amazon.privilege.security.file-sharing"

# Group-IPC
[[wants.service]]
id = "com.amazon.gipc.uuid.*"

[offers]
[[offers.service]]
id = "com.amazon.gipc.uuid.*"
```

---

## 2. WebView 기본 구현

### src/App.tsx
```typescript
import { WebView } from "@amazon-devices/webview";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";

export const App = () => {
  const webRef = useRef<any>(null);

  const styles = StyleSheet.create({
    container: { flex: 1 },
  });

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        hasTVPreferredFocus={true}
        allowSystemKeyEvents={true}
        source={{ uri: "https://your-website.com" }}
        javaScriptEnabled={true}
        onLoad={() => {
          console.log("WebView loaded");
        }}
      />
    </View>
  );
};
```

---

## 3. 리모컨 키 연동 (핵심)

### 3.1 Vega OS 리모컨 키 코드
```javascript
const VEGA_KEY = {
  ENTER: 13,
  GO_BACK: 27,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40,
  ARROW_UP: 38,
  MEDIA_PLAY_PAUSE: 179,
  MEDIA_REWIND: 227,
  MEDIA_FAST_FORWARD: 228
};
```

⚠️ **주의**: 볼륨/뮤트 키는 시스템이 직접 처리하여 앱에서 감지 불가

### 3.2 JavaScript 주입으로 키 이벤트 처리
```typescript
const setupRemoteControl = () => {
  if (webRef.current) {
    webRef.current.injectJavaScript(`
      (function() {
        // 키 이벤트 리스너 등록
        document.addEventListener('keydown', function(event) {
          var keyCode = event.keyCode;
          
          switch (keyCode) {
            case 13: // ENTER
              // 전체화면 토글 예시
              var iframe = document.getElementById('iframe');
              if (iframe && !document.fullscreenElement) {
                iframe.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
              break;
              
            case 37: // LEFT: 10초 뒤로
              controller?.rw(10);
              break;
              
            case 39: // RIGHT: 10초 앞으로
              controller?.ff(10);
              break;
              
            case 38: // UP: 볼륨 업
              var vol = controller?.get_volume();
              controller?.set_volume(Math.min(vol + 10, 100));
              break;
              
            case 40: // DOWN: 볼륨 다운
              var vol = controller?.get_volume();
              controller?.set_volume(Math.max(vol - 10, 0));
              break;
              
            case 179: // PLAY_PAUSE
              if (status === 'play') {
                controller?.pause();
                status = 'pause';
              } else {
                controller?.play();
                status = 'play';
              }
              break;
              
            case 227: // REWIND: 30초 뒤로
              controller?.rw(30);
              break;
              
            case 228: // FAST_FORWARD: 30초 앞으로
              controller?.ff(30);
              break;
          }
          
          // 기본 동작 방지
          event.preventDefault();
          event.stopPropagation();
        }, true); // capture phase에서 이벤트 캐치
        
        console.log('✓ Remote control ready');
      })();
      true;
    `);
  }
};

// WebView 컴포넌트에서 사용
<WebView
  ref={webRef}
  onLoad={() => {
    setupRemoteControl();
  }}
/>
```

### 3.3 핵심 포인트

1. **`injectJavaScript`**: React Native에서 WebView로 JavaScript 코드 주입
2. **Capture Phase**: `addEventListener(..., true)` - 웹페이지의 기존 핸들러보다 먼저 이벤트 캡처
3. **onLoad 호출**: WebView 로드 완료 시 바로 키 핸들러 등록

---

## 4. React Native ↔ WebView 통신

### WebView → React Native

**WebView에서 메시지 전송:**
```javascript
window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'event',
  data: { volume: 50 }
}));
```

**React Native에서 수신:**
```typescript
<WebView
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('Received:', data);
  }}
/>
```

### React Native → WebView
```typescript
webRef.current?.injectJavaScript(`
  // 실행할 JavaScript 코드
  console.log('Hello from React Native');
  controller?.play();
  true; // 반드시 true 리턴
`);
```

---

## 5. 트러블슈팅

### ❌ 리모컨 키 입력이 안 됨

**증상**: 버튼을 눌러도 아무 반응 없음

**원인과 해결:**

**웹페이지의 기존 키 핸들러가 이벤트 가로챔**
```javascript
// 해결: capture phase에서 캐치
document.addEventListener('keydown', handler, true);
```

💡 **추가 팁**: 웹페이지에 `setInterval`로 포커스를 강제로 이동시키는 코드가 있다면, 해당 타이머를 제거해야 할 수 있습니다.

### ❌ DRM 콘텐츠 재생 실패

**해결**: manifest.toml에 DRM 서비스 추가 (위 섹션 1 참고)

### ❌ iframe 내부 플레이어 제어 불가

**다른 도메인의 iframe인 경우:**
```javascript
// postMessage API 사용
iframe.contentWindow.postMessage({ action: 'play' }, '*');
```

---

## 6. 전체 예제 코드
```typescript
import { WebView } from "@amazon-devices/webview";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";

export const App = () => {
  const webRef = useRef<any>(null);

  const setupRemoteControl = () => {
    if (webRef.current) {
      webRef.current.injectJavaScript(`
        (function() {
          // 키 이벤트 리스너
          document.addEventListener('keydown', function(event) {
            var keyCode = event.keyCode;
            
            switch (keyCode) {
              case 13: // ENTER: 전체화면 토글
                var iframe = document.getElementById('iframe');
                if (iframe && !document.fullscreenElement) {
                  iframe.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
                break;
              case 37: controller?.rw(10); break;
              case 39: controller?.ff(10); break;
              case 38:
                var vol = controller?.get_volume();
                controller?.set_volume(Math.min(vol + 10, 100));
                break;
              case 40:
                var vol = controller?.get_volume();
                controller?.set_volume(Math.max(vol - 10, 0));
                break;
              case 179:
                if (status === 'play') {
                  controller?.pause();
                  status = 'pause';
                } else {
                  controller?.play();
                  status = 'play';
                }
                break;
              case 227: controller?.rw(30); break;
              case 228: controller?.ff(30); break;
            }
            
            event.preventDefault();
            event.stopPropagation();
          }, true);
        })();
        true;
      `);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
  });

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        hasTVPreferredFocus={true}
        allowSystemKeyEvents={true}
        source={{ uri: "https://your-website.com" }}
        javaScriptEnabled={true}
        onLoad={() => {
          setupRemoteControl();
        }}
      />
    </View>
  );
};
```

---

## 참고 문서

- [Vega OS 시작하기](https://developer.amazon.com/docs/vega/get-started.html)
- [WebView 개발 가이드](https://developer.amazon.com/docs/vega/develop-your-app-with-webview.html)
- [Kepler CLI 레퍼런스](https://developer.amazon.com/docs/vega/kepler-cli.html)

---

**작성일**: 2024-12-03  
**버전**: 1.0
