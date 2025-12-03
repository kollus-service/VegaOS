// Vega OS WebView with Kollus Multi-DRM integration sample application
import { WebView } from "@amazon-devices/webview";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { IComponentInstance, useComponentInstance } from "@amazon-devices/react-native-kepler";

/**
 * App Component
 *
 * Main application component running on Vega OS.
 * Plays DRM-protected content using WebView and
 * provides media control functionality via TV remote.
 */
export const App = () => {
  // Ref to store WebView reference (used for JavaScript injection)
  const webRef = useRef<any>(null);

  // Kepler component instance (interacts with Vega OS platform)
  const componentInstance: IComponentInstance = useComponentInstance();

  /**
   * TV Remote Control Setup Function
   *
   * Injects JavaScript code into WebView to detect Vega OS remote's
   * key events and control the media player.
   */
  const setupRemoteControl = () => {
    if (webRef.current) {
      // Inject JavaScript code into WebView
      webRef.current.injectJavaScript(`
        (function() {
          console.log('Setting up Vega OS remote control');


          // Register Vega OS remote key event handler
          document.addEventListener('keydown', function(event) {
            var keyCode = event.keyCode;

            console.log('Key pressed:', keyCode);

            // Handle actions based on remote key
            switch (keyCode) {
              // ENTER key (keycode 13) - Toggle fullscreen
              case 13:
                document.getElementById('fullscreenBtn').addEventListener('click', function() {
                  // Switch to fullscreen if not in fullscreen
                  if (!document.fullscreenElement) {
                    document.getElementById('player-container').requestFullscreen && document.getElementById('player-container').requestFullscreen();
                  } else {
                    // Exit fullscreen if in fullscreen
                    document.exitFullscreen && document.exitFullscreen();
                  }
                });
                break;


              // Left arrow key (keycode 37) - Rewind 10 seconds
              case 37:
                console.log('Left - Rewind 10s');
                controller.rw(10);
                break;

              // Up arrow key (keycode 38) - Volume up
              case 38:
                console.log('Up - Volume up');
                var volUp = controller.get_volume();
                controller.set_volume(Math.min(volUp + 10, 100)); // Max 100
                break;

              // Right arrow key (keycode 39) - Fast forward 10 seconds
              case 39:
                console.log('Right - Forward 10s');
                controller.ff(10);
                break;

              // Down arrow key (keycode 40) - Volume down
              case 40:
                console.log('Down - Volume down');
                var volDown = controller.get_volume();
                controller.set_volume(Math.max(volDown - 10, 0)); // Min 0
                break;

              // PlayPause button (keycode 179) - Toggle play/pause
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

              // Rewind button (keycode 227) - Rewind 30 seconds
              case 227:
                console.log('Rewind button - 30s');
                controller.rw(30);
                break;

              // Fast Forward button (keycode 228) - Fast forward 30 seconds
              case 228:
                console.log('Fast Forward button - 30s');
                controller.ff(30);
                break;

              // Unknown key
              default:
                console.log('Unknown key:', keyCode);
            }

            // Prevent event propagation (block browser default behavior)
            event.preventDefault();
            event.stopPropagation();
          }, true);

          console.log('Remote control ready');
        })();
        true; // Return JavaScript injection success
      `);
    }
  };

  // Style definition
  const styles = StyleSheet.create({
    container: { flex: 1 }, // Fill entire screen
  });

  // Component rendering
  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        hasTVPreferredFocus={true}              // Set focus priority on TV
        allowSystemKeyEvents={true}             // Allow system key events
        source={{ uri: "https://web.as1as.net/jp/vega_test2.php" }} // Kollus Multi-DRM test page
        javaScriptEnabled={true}                // Enable JavaScript execution
        onLoad={() => {
          console.log("WebView loaded");
          setupRemoteControl();                 // Setup remote control after page load
        }}
      />
    </View>
  );
};