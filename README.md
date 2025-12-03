# KeplerProject - Vega OS WebView with Kollus Multi-DRM Integration

A WebView-based media player sample application integrating Kollus Multi-DRM on the Vega OS platform.

## Project Overview

This is a TV application that plays DRM-protected content using WebView in the Amazon Vega OS environment. Built with React Native and leveraging the Kepler framework.

## Key Features

- **WebView-based Content Playback**: Play media content protected by Kollus Multi-DRM
- **TV Remote Control**: Control player using Vega OS remote's directional and media keys
- **Fullscreen Support**: Toggle fullscreen with Enter key
- **Media Controls**:
  - Play/Pause (PlayPause button)
  - Fast Forward/Rewind (Left/Right arrow keys, FF/REW buttons)
  - Volume Control (Up/Down arrow keys)

## Tech Stack

- **React Native**: 0.72.0
- **React**: 18.2.0
- **Amazon Kepler**: TV application framework
- **Amazon WebView**: 3.3.x (WebView component for Vega OS)
- **TypeScript**: 4.8.4

## Project Structure

```
KeplerProject/
├── src/
│   ├── App.tsx              # Main application component
│   ├── components/          # UI components
│   │   └── Link.tsx
│   └── assets/             # Images and resources
├── test/
│   └── App.spec.tsx        # Test files
├── app.json                # App metadata
├── package.json            # Project dependencies
├── manifest.toml           # App Configuration
├── tsconfig.json           # TypeScript configuration
└── jest.config.json        # Test configuration
```

## Installation and Running

### Prerequisites

- Node.js
- Amazon Kepler CLI
- Vega OS development environment

## Remote Control Key Mapping

| Key | Key Code | Function |
|---|---|---|
| Enter | 13 | Toggle fullscreen |
| Left Arrow | 37 | Rewind 10 seconds |
| Up Arrow | 38 | Volume +10 |
| Right Arrow | 39 | Fast forward 10 seconds |
| Down Arrow | 40 | Volume -10 |
| PlayPause | 179 | Play/Pause toggle |
| Rewind | 227 | Rewind 30 seconds |
| Fast Forward | 228 | Fast forward 30 seconds |

## Main Dependencies

### Runtime Dependencies
- `@amazon-devices/react-native-kepler`: Kepler platform integration
- `@amazon-devices/webview`: Vega OS WebView component
- `@amazon-devices/kepler-media-controls`: Media control API
- `@amazon-devices/kepler-media-types`: Media type definitions

## Target Platform

- Vega OS TV
