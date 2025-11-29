# Audio Recorder App - User Guide

## 🎵 Overview
This is an Android audio recording app that lets you record, play, and listen to audio in reverse!

## 📱 How to Test on Your Android Device

### Option 1: Using Expo Go App (Recommended)
1. **Download Expo Go** from Google Play Store on your Android device
2. **Open Expo Go** app
3. **Scan the QR code** or enter this URL:
   ```
   exp://sound-reverser.preview.emergentagent.com
   ```
4. The app will load on your device!

### Option 2: Web Preview (Limited Audio Features)
Open in browser: https://sound-reverser.preview.emergentagent.com
⚠️ Note: Web browsers have limited audio recording capabilities. For full functionality, use Expo Go on Android.

## 🎯 Features

### 1️⃣ Normal Recording Section
- **Red "Record" Button**: Tap to start recording audio
  - Shows animated waveform while recording
  - Timer counts up to 30 seconds (auto-stops at 30s)
  - Tap "Stop" to end recording early
- **After Recording**: Button transforms to show:
  - 🟢 **Play Button**: Listen to your normal recording
  - 🔵 **Retry Button**: Delete and record again

### 2️⃣ Play Backward Button (Middle)
- 🟣 **Purple Button**: Plays the second recording in reverse
- Disabled until you make a second recording

### 3️⃣ Record for Backward Section
- **Orange "Record" Button**: Tap to start recording
  - Same features as first recording (waveform, timer, auto-stop)
- **After Recording**: Button transforms to show:
  - 🟢 **Play Backward Button**: Listen to your recording played in reverse!
  - 🔵 **Retry Button**: Delete and record again

### 🆕 New Session
- Tap the "New Session" button at the bottom to clear all recordings and start fresh

## 🎨 UI Features
- **Colorful Design**: Clean, modern interface with vibrant colors
- **Waveform Animation**: Visual feedback while recording
- **Timer**: See recording duration in real-time
- **Icons**: Clear Ionicons for all actions

## 🔧 Technical Details
- **Recording Quality**: High quality audio (m4a format)
- **Max Duration**: 30 seconds per recording
- **Permissions**: Microphone access required (you'll be prompted)
- **Storage**: In-memory only (no database - recordings cleared when app closes)
- **Audio Reversal**: Uses byte-level reversal for backward playback effect

## 🐛 Troubleshooting

### "Microphone permission required"
- Tap "Grant Permission" and allow microphone access
- On Android: Go to Settings > Apps > Expo Go > Permissions > Microphone > Allow

### Recording doesn't start
- Make sure you've granted microphone permission
- Try restarting the app

### Audio sounds distorted when reversed
- This is expected! The app uses byte-level reversal which creates a "backward" effect
- The quality depends on the audio characteristics

### App won't load in Expo Go
- Make sure you're connected to the internet
- Check if the URL is correct: exp://sound-reverser.preview.emergentagent.com
- Try closing and reopening Expo Go

## 📝 Notes
- Recordings are NOT saved permanently - they're cleared when you close the app
- For best results, record in a quiet environment
- The app works on both Android and iOS (iOS may require additional setup)
- Web version has limited functionality due to browser restrictions

## 🎉 Enjoy Recording!
Have fun experimenting with normal and reversed audio recordings!
