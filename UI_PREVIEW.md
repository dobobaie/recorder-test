# Audio Recorder App - UI Preview

## 📱 App Screenshots (What You'll See)

### Initial Screen - Permission Request
- Clean permission screen with "Grant Permission" button
- Blue button design for accessibility

### Main App Interface (After Permission Granted)

#### Top Section
- **Title**: "Audio Recorder" 
- **Subtitle**: "Record, Play & Reverse"

#### Section 1: Normal Recording
- **Label**: "Normal Recording"
- **Red "Record" Button** (with microphone icon)
- While recording:
  - Animated waveform bars (5 bars pulsing)
  - Timer display: "0:15 / 0:30"
  - Gray "Stop" button
- After recording:
  - 🟢 **Green "Play" button** (plays normal recording)
  - 🔵 **Blue "Retry" button** (delete and re-record)

#### Section 2: Play Backward
- **Purple "Play Backward" Button** (with backward play icon)
- Disabled (grayed out) until second recording is made
- Plays the second recording in reverse

#### Section 3: Record for Backward
- **Label**: "Record for Backward"
- **Orange "Record" Button** (with microphone icon)
- Same recording features as Section 1
- After recording:
  - 🟢 **Green "Play Backward" button** (plays reversed audio)
  - 🔵 **Blue "Retry" button** (delete and re-record)

#### Bottom Section
- **"New Session" Button** (outlined in blue with plus icon)
- Clears all recordings and starts fresh

## 🎨 Color Scheme
- **Background**: Light gray/white (#f8fafc) - sober and clean
- **Record Button 1**: Red (#ef4444) - energetic
- **Record Button 2**: Orange (#f59e0b) - warm
- **Play Backward**: Purple (#8b5cf6) - creative
- **Play Button**: Green (#10b981) - positive
- **Action Buttons**: Blue (#6366f1) - trustworthy
- **Stop Button**: Gray (#64748b) - neutral
- **Text**: Dark slate for contrast

## ✨ Interactive Features
- All buttons have elevation/shadow effects
- Smooth animations for waveforms
- Icons from Ionicons library
- Responsive touch targets (minimum 44x44 points)
- Safe area support for devices with notches
- Scrollable content if needed

## 📐 Layout
- Centered content
- Consistent spacing (24px between sections)
- Rounded corners (12-16px) for modern look
- Clear visual hierarchy
- Mobile-optimized design

## 🔊 Audio Features
- High-quality recording (m4a format)
- Real-time recording timer
- Auto-stop at 30 seconds
- Byte-level audio reversal for backward playback
- In-memory storage (no permanent saving)

---

**Note**: This app is designed for mobile devices. For the best experience, test it on your Android device using Expo Go!
