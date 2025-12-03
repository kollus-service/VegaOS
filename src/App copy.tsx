import { WebView } from "@amazon-devices/webview";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { IComponentInstance, useComponentInstance } from "@amazon-devices/react-native-kepler";

export const App = () => {
  const webRef = useRef<any>(null);
  const componentInstance: IComponentInstance = useComponentInstance();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString().split(' ')[1];
    console.log(msg);
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 12));
  };

  // 웹페이지의 키 핸들러를 수정
  const setupCustomKeyHandler = () => {
    if (webRef.current) {
      webRef.current.injectJavaScript(`
        (function() {
          console.log('Setting up custom key handler');
          
          // 기존 keydown 리스너 제거
          var oldAddEventListener = document.addEventListener;
          document.removeEventListener('keydown', setupRemoteKeyEvents);
          
          // iframe 포커스 타이머 제거
          var highestTimeoutId = setTimeout(";");
          for (var i = 0 ; i < highestTimeoutId ; i++) {
            clearTimeout(i);
            clearInterval(i);
          }
          
          // 새로운 키 핸들러 등록
          document.addEventListener('keydown', function(event) {
            var keyCode = event.keyCode;
            
            // 시각적 피드백
            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,255,0,0.95);color:black;padding:60px 80px;font-size:70px;font-weight:bold;z-index:999999;border-radius:20px;box-shadow:0 0 30px rgba(0,255,0,0.5);';
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'log',
              message: 'Key: ' + keyCode
            }));
            
            switch (keyCode) {
              case 13: // ENTER
                overlay.innerText = '▶ ENTER';
                overlay.style.background = 'rgba(0,255,0,0.95)';
                if (status === 'play') {
                  controller.pause();
                  status = 'pause';
                } else {
                  controller.play();
                  status = 'play';
                }
                break;
                
              case 179: // MEDIA_PLAY_PAUSE
                overlay.innerText = status === 'play' ? '⏸ PAUSE' : '▶ PLAY';
                overlay.style.background = status === 'play' ? 'rgba(255,165,0,0.95)' : 'rgba(0,255,0,0.95)';
                if (status === 'play') {
                  controller.pause();
                  status = 'pause';
                } else {
                  controller.play();
                  status = 'play';
                }
                break;
                
              case 37: // ARROW_LEFT
                overlay.innerText = '⏪ -10s';
                overlay.style.background = 'rgba(255,100,100,0.95)';
                controller.rw(10);
                break;
                
              case 39: // ARROW_RIGHT
                overlay.innerText = '⏩ +10s';
                overlay.style.background = 'rgba(100,150,255,0.95)';
                controller.ff(10);
                break;
                
              case 38: // ARROW_UP
                overlay.innerText = '🔊 VOL +';
                overlay.style.background = 'rgba(150,150,255,0.95)';
                var currentVolume = controller.get_volume();
                controller.set_volume(currentVolume + 10);
                break;
                
              case 40: // ARROW_DOWN
                overlay.innerText = '🔉 VOL -';
                overlay.style.background = 'rgba(150,150,255,0.95)';
                var currentVolume = controller.get_volume();
                controller.set_volume(currentVolume - 10);
                break;
                
              case 228: // MEDIA_FAST_FORWARD
                overlay.innerText = '⏩⏩ +30s';
                overlay.style.background = 'rgba(100,150,255,0.95)';
                controller.ff(30);
                break;
                
              case 227: // MEDIA_REWIND
                overlay.innerText = '⏪⏪ -30s';
                overlay.style.background = 'rgba(255,100,100,0.95)';
                controller.rw(30);
                break;
                
              case 27: // GO_BACK
                overlay.innerText = '◀ BACK';
                overlay.style.background = 'rgba(200,200,200,0.95)';
                break;
                
              default:
                overlay.innerText = 'KEY: ' + keyCode;
                overlay.style.background = 'rgba(128,128,128,0.95)';
            }
            
            document.body.appendChild(overlay);
            setTimeout(function() {
              overlay.remove();
            }, 1500);
            
            event.preventDefault();
            event.stopPropagation();
          }, true); // capture phase
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'log',
            message: '✓ Custom handler ready'
          }));
        })();
        true;
      `);
    }
  };

  const handleReload = () => {
    addLog("Reloading...");
    if (webRef.current) {
      webRef.current.reload();
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'log') {
        addLog(data.message);
      }
    } catch (error) {
      // ignore
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      height: 350,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      padding: 15,
      zIndex: 1000,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#00FF00',
    },
    title: {
      color: '#00FF00',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    instruction: {
      color: '#FFFF00',
      fontSize: 13,
      marginBottom: 12,
      lineHeight: 18,
    },
    logScroll: {
      flex: 1,
      marginBottom: 10,
    },
    logText: {
      color: 'white',
      fontSize: 13,
      marginBottom: 4,
      fontFamily: 'monospace',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 14,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 13,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>🎮 Vega OS Remote Control</Text>
        <Text style={styles.instruction}>
          Setup 후 리모컨 버튼을 눌러보세요!{'\n'}
          화면에 큰 오버레이가 표시됩니다.
        </Text>
        <ScrollView style={styles.logScroll}>
          {logs.map((log, idx) => (
            <Text key={idx} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} focusable onPress={setupCustomKeyHandler}>
            <Text style={styles.buttonText}>Setup Keys</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} focusable onPress={handleReload}>
            <Text style={styles.buttonText}>Reload</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <WebView
        ref={webRef}
        hasTVPreferredFocus={true}
        allowSystemKeyEvents={true}
        source={{ uri: "https://web.as1as.net/jp/vega_test2.php" }}
        javaScriptEnabled={true}
        onLoad={() => {
          addLog("WebView loaded");
          // 페이지가 완전히 로드된 후 설정
          setTimeout(() => {
            setupCustomKeyHandler();
          }, 2000);
        }}
        onMessage={handleWebViewMessage}
        onError={(event) => {
          addLog("Error: " + event.nativeEvent.description);
        }}
      />
    </View>
  );
};