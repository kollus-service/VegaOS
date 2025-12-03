// Vega OS WebView와 Kollus Multi-DRM 통합 샘플 애플리케이션
import { WebView } from "@amazon-devices/webview";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { IComponentInstance, useComponentInstance } from "@amazon-devices/react-native-kepler";

/**
 * App 컴포넌트
 *
 * Vega OS에서 실행되는 메인 애플리케이션 컴포넌트입니다.
 * WebView를 사용하여 DRM 보호 콘텐츠를 재생하고,
 * TV 리모컨을 통한 미디어 제어 기능을 제공합니다.
 */
export const App = () => {
  // WebView 참조를 저장하는 ref (JavaScript 주입에 사용)
  const webRef = useRef<any>(null);

  // Kepler 컴포넌트 인스턴스 (Vega OS 플랫폼과 상호작용)
  const componentInstance: IComponentInstance = useComponentInstance();

  /**
   * TV 리모컨 제어 설정 함수
   *
   * WebView 내부에 JavaScript 코드를 주입하여 Vega OS 리모컨의
   * 키 이벤트를 감지하고 미디어 플레이어를 제어합니다.
   */
  const setupRemoteControl = () => {
    if (webRef.current) {
      // WebView에 JavaScript 코드 주입
      webRef.current.injectJavaScript(`
        (function() {
          console.log('Setting up Vega OS remote control');


          // Vega OS 리모컨 키 이벤트 핸들러 등록
          document.addEventListener('keydown', function(event) {
            var keyCode = event.keyCode;
            
            console.log('Key pressed:', keyCode);
            
            // 리모컨 키에 따른 동작 처리
            switch (keyCode) {
              // ENTER 키 (키코드 13) - 전체화면 토글
              case 13:
                document.getElementById('fullscreenBtn').addEventListener('click', function() {
                  // 전체화면이 아닌 경우 전체화면으로 전환
                  if (!document.fullscreenElement) {
                    document.getElementById('player-container').requestFullscreen && document.getElementById('player-container').requestFullscreen();
                  } else {
                    // 전체화면인 경우 전체화면 해제
                    document.exitFullscreen && document.exitFullscreen();
                  }
                });
                break;


              // 좌측 방향키 (키코드 37) - 10초 되감기
              case 37:
                console.log('Left - Rewind 10s');
                controller.rw(10);
                break;

              // 상단 방향키 (키코드 38) - 볼륨 증가
              case 38:
                console.log('Up - Volume up');
                var volUp = controller.get_volume();
                controller.set_volume(Math.min(volUp + 10, 100)); // 최대 100
                break;

              // 우측 방향키 (키코드 39) - 10초 빨리감기
              case 39:
                console.log('Right - Forward 10s');
                controller.ff(10);
                break;

              // 하단 방향키 (키코드 40) - 볼륨 감소
              case 40:
                console.log('Down - Volume down');
                var volDown = controller.get_volume();
                controller.set_volume(Math.max(volDown - 10, 0)); // 최소 0
                break;

              // PlayPause 버튼 (키코드 179) - 재생/일시정지 토글
              case 179:
                console.log('PlayPause button');
                if (status === 'play') {
                  controller.pause();
                  status = 'pause';
                } else {
                  controller.play();
                  status = 'play';
                }
                break;

              // Rewind 버튼 (키코드 227) - 30초 되감기
              case 227:
                console.log('Rewind button - 30s');
                controller.rw(30);
                break;

              // Fast Forward 버튼 (키코드 228) - 30초 빨리감기
              case 228:
                console.log('Fast Forward button - 30s');
                controller.ff(30);
                break;

              // 알 수 없는 키
              default:
                console.log('Unknown key:', keyCode);
            }

            // 이벤트 전파 방지 (브라우저 기본 동작 차단)
            event.preventDefault();
            event.stopPropagation();
          }, true);

          console.log('Remote control ready');
        })();
        true; // JavaScript 주입 성공 반환
      `);
    }
  };

  // 스타일 정의
  const styles = StyleSheet.create({
    container: { flex: 1 }, // 전체 화면 채우기
  });

  // 컴포넌트 렌더링
  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        hasTVPreferredFocus={true}              // TV에서 포커스 우선순위 설정
        allowSystemKeyEvents={true}             // 시스템 키 이벤트 허용
        source={{ uri: "https://web.as1as.net/jp/vega_test2.php" }} // Kollus Multi-DRM 테스트 페이지
        javaScriptEnabled={true}                // JavaScript 실행 활성화
        onLoad={() => {
          console.log("WebView loaded");
          setupRemoteControl();                 // 페이지 로드 후 리모컨 제어 설정
        }}
      />
    </View>
  );
};