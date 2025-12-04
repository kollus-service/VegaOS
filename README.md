# Vega OS WebView App Development Guide

## Prerequisites

### Refer to Official Vega OS Documentation
- **Project Creation**: https://developer.amazon.com/docs/vega/get-started.html
- **Build & Deploy**: https://developer.amazon.com/docs/vega/kepler-cli.html
- **WebView API**: https://developer.amazon.com/docs/vega/develop-your-app-with-webview.html

---

## 1. manifest.toml Required Configuration

### DRM and Media Services (Required for Video Playback)
```toml
[wants]
# WebView renderer
[[wants.service]]
id = "com.amazon.webview.renderer_service"

# Media playback
[[wants.service]]
id = "com.amazon.media.server"
[[wants.service]]
id = "com.amazon.mediametrics.service"
[[wants.service]]
id = "com.amazon.mediabuffer.service"
[[wants.service]]
id = "com.amazon.mediatransform.service"

# Audio
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

## 2. Basic WebView Implementation

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

## 3. Remote Control Key Integration (Core)

### 3.1 Vega OS Remote Key Codes
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

⚠️ **Note**: Volume/Mute keys are handled by the system and cannot be detected by the app

### 3.2 Key Event Handling via JavaScript Injection
```typescript
const setupRemoteControl = () => {
  if (webRef.current) {
    webRef.current.injectJavaScript(`
      (function() {
        // Register key event listener
        document.addEventListener('keydown', function(event) {
          var keyCode = event.keyCode;
          
          switch (keyCode) {
            case 13: // ENTER
              // Fullscreen toggle example
              var iframe = document.getElementById('iframe');
              if (iframe && !document.fullscreenElement) {
                iframe.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
              break;
              
            case 37: // LEFT: Rewind 10 seconds
              controller?.rw(10);
              break;
              
            case 39: // RIGHT: Forward 10 seconds
              controller?.ff(10);
              break;
              
            case 38: // UP: Volume up
              var vol = controller?.get_volume();
              controller?.set_volume(Math.min(vol + 10, 100));
              break;
              
            case 40: // DOWN: Volume down
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
              
            case 227: // REWIND: 30 seconds back
              controller?.rw(30);
              break;
              
            case 228: // FAST_FORWARD: 30 seconds forward
              controller?.ff(30);
              break;
          }
          
          // Prevent default behavior
          event.preventDefault();
          event.stopPropagation();
        }, true); // Capture phase
        
        console.log('✓ Remote control ready');
      })();
      true;
    `);
  }
};

// Use in WebView component
<WebView
  ref={webRef}
  onLoad={() => {
    setupRemoteControl();
  }}
/>
```

### 3.3 Key Points

1. **`injectJavaScript`**: Inject JavaScript code from React Native to WebView
2. **Capture Phase**: `addEventListener(..., true)` - Capture events before the webpage's existing handlers
3. **onLoad Callback**: Register key handler immediately after WebView loads

---

## 4. React Native ↔ WebView Communication

### WebView → React Native

**Sending message from WebView:**
```javascript
window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'event',
  data: { volume: 50 }
}));
```

**Receiving in React Native:**
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
  // JavaScript code to execute
  console.log('Hello from React Native');
  controller?.play();
  true; // Must return true
`);
```

---

## 5. Troubleshooting

### ❌ Remote Key Input Not Working

**Symptom**: No response when pressing remote buttons

**Cause and Solution:**

**Webpage's existing key handlers intercept events**
```javascript
// Solution: Capture in capture phase
document.addEventListener('keydown', handler, true);
```

💡 **Additional Tip**: If the webpage has `setInterval` code that forcibly moves focus, you may need to remove those timers.

### ❌ DRM Content Playback Failure

**Solution**: Add DRM services to manifest.toml (see Section 1 above)

### ❌ Cannot Control Player Inside iframe

**For cross-domain iframes:**
```javascript
// Use postMessage API
iframe.contentWindow.postMessage({ action: 'play' }, '*');
```

---

## 6. Complete Example Code
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
          // Key event listener
          document.addEventListener('keydown', function(event) {
            var keyCode = event.keyCode;
            
            switch (keyCode) {
              case 13: // ENTER: Toggle fullscreen
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

## References

- [Getting Started with Vega OS](https://developer.amazon.com/docs/vega/get-started.html)
- [WebView Development Guide](https://developer.amazon.com/docs/vega/develop-your-app-with-webview.html)
- [Kepler CLI Reference](https://developer.amazon.com/docs/vega/kepler-cli.html)

---

**Created**: December 3, 2024  
**Version**: 1.0
