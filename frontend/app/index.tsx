import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Animated,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';

interface Recording {
  uri: string;
  duration: number;
}

export default function Index() {
  // Permissions
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // Recording states
  const [recording1, setRecording1] = useState<Audio.Recording | null>(null);
  const [recording2, setRecording2] = useState<Audio.Recording | null>(null);
  const [isRecording1, setIsRecording1] = useState(false);
  const [isRecording2, setIsRecording2] = useState(false);
  
  // Recorded audio states
  const [audio1, setAudio1] = useState<Recording | null>(null);
  const [audio2, setAudio2] = useState<Recording | null>(null);
  
  // Playback states
  const [sound1, setSound1] = useState<Audio.Sound | null>(null);
  const [sound2, setSound2] = useState<Audio.Sound | null>(null);
  const [soundBackward1, setSoundBackward1] = useState<Audio.Sound | null>(null);
  const [soundBackward2, setSoundBackward2] = useState<Audio.Sound | null>(null);
  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);
  const [isPlayingBackward1, setIsPlayingBackward1] = useState(false);
  const [isPlayingBackward2, setIsPlayingBackward2] = useState(false);
  
  // Timer states
  const [recordingTime1, setRecordingTime1] = useState(0);
  const [recordingTime2, setRecordingTime2] = useState(0);
  const timerInterval1 = useRef<NodeJS.Timeout | null>(null);
  const timerInterval2 = useRef<NodeJS.Timeout | null>(null);
  
  // Waveform animation
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;

  const MAX_RECORDING_DURATION = 30000; // 30 seconds

  useEffect(() => {
    requestPermissions();
    setupAudio();
    
    return () => {
      // Cleanup
      if (sound1) sound1.unloadAsync();
      if (sound2) sound2.unloadAsync();
      if (soundBackward1) soundBackward1.unloadAsync();
      if (soundBackward2) soundBackward2.unloadAsync();
      if (recording1) recording1.stopAndUnloadAsync();
      if (recording2) recording2.stopAndUnloadAsync();
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.error('Failed to setup audio:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to record audio.'
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const startWaveAnimation = (waveAnim: Animated.Value) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopWaveAnimation = (waveAnim: Animated.Value) => {
    waveAnim.stopAnimation();
    waveAnim.setValue(0);
  };

  const startRecording1 = async () => {
    if (!permissionGranted) {
      Alert.alert('Permission Required', 'Please grant microphone permission');
      return;
    }

    try {
      // Stop any playing sound
      if (sound1) {
        await sound1.stopAsync();
        await sound1.unloadAsync();
        setSound1(null);
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording1(recording);
      setIsRecording1(true);
      setRecordingTime1(0);
      startWaveAnimation(waveAnim1);

      // Start timer
      timerInterval1.current = setInterval(() => {
        setRecordingTime1(prev => {
          const newTime = prev + 1;
          if (newTime >= 30) {
            stopRecording1();
          }
          return newTime;
        });
      }, 1000);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (recording) {
          stopRecording1();
        }
      }, MAX_RECORDING_DURATION);

    } catch (error) {
      console.error('Failed to start recording 1:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording1(false);
    }
  };

  const stopRecording1 = async () => {
    if (!recording1) return;

    try {
      setIsRecording1(false);
      stopWaveAnimation(waveAnim1);
      
      if (timerInterval1.current) {
        clearInterval(timerInterval1.current);
        timerInterval1.current = null;
      }

      await recording1.stopAndUnloadAsync();
      const uri = recording1.getURI();
      const status = await recording1.getStatusAsync();
      
      if (uri) {
        setAudio1({
          uri,
          duration: status.durationMillis || 0
        });
      }
      
      setRecording1(null);
    } catch (error) {
      console.error('Failed to stop recording 1:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const startRecording2 = async () => {
    if (!permissionGranted) {
      Alert.alert('Permission Required', 'Please grant microphone permission');
      return;
    }

    try {
      // Stop any playing sound
      if (sound2) {
        await sound2.stopAsync();
        await sound2.unloadAsync();
        setSound2(null);
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording2(recording);
      setIsRecording2(true);
      setRecordingTime2(0);
      startWaveAnimation(waveAnim2);

      // Start timer
      timerInterval2.current = setInterval(() => {
        setRecordingTime2(prev => {
          const newTime = prev + 1;
          if (newTime >= 30) {
            stopRecording2();
          }
          return newTime;
        });
      }, 1000);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (recording) {
          stopRecording2();
        }
      }, MAX_RECORDING_DURATION);

    } catch (error) {
      console.error('Failed to start recording 2:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording2(false);
    }
  };

  const stopRecording2 = async () => {
    if (!recording2) return;

    try {
      setIsRecording2(false);
      stopWaveAnimation(waveAnim2);
      
      if (timerInterval2.current) {
        clearInterval(timerInterval2.current);
        timerInterval2.current = null;
      }

      await recording2.stopAndUnloadAsync();
      const uri = recording2.getURI();
      const status = await recording2.getStatusAsync();
      
      if (uri) {
        setAudio2({
          uri,
          duration: status.durationMillis || 0
        });
      }
      
      setRecording2(null);
    } catch (error) {
      console.error('Failed to stop recording 2:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // Helper function to convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    
    const data = [];
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      data.push(buffer.getChannelData(i));
    }
    
    const interleaved = new Float32Array(buffer.length * numberOfChannels);
    for (let src = 0; src < buffer.length; src++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        interleaved[src * numberOfChannels + channel] = data[channel][src];
      }
    }
    
    const dataLength = interleaved.length * bytesPerSample;
    const headerLength = 44;
    const wav = new ArrayBuffer(headerLength + dataLength);
    const view = new DataView(wav);
    
    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    const volume = 0.8;
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      const sample = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return wav;
  };

  const playAudio1 = async () => {
    if (!audio1) return;

    try {
      // If already playing, stop it
      if (isPlaying1 && sound1) {
        await sound1.stopAsync();
        await sound1.unloadAsync();
        setSound1(null);
        setIsPlaying1(false);
        return;
      }

      if (sound1) {
        await sound1.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audio1.uri },
        { shouldPlay: true }
      );

      setSound1(sound);
      setIsPlaying1(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying1(false);
        }
      });

    } catch (error) {
      console.error('Failed to play audio 1:', error);
      Alert.alert('Error', 'Failed to play audio');
      setIsPlaying1(false);
    }
  };

  const reverseAudioFile = async (audioUri: string): Promise<string> => {
    try {
      console.log('Starting audio reversal for:', audioUri);
      console.log('Platform:', Platform.OS);
      
      // For web, use Web Audio API for proper audio reversal
      if (Platform.OS === 'web' || audioUri.startsWith('blob:')) {
        console.log('Using Web Audio API reversal');
        
        // Fetch the audio file
        const response = await fetch(audioUri);
        const arrayBuffer = await response.arrayBuffer();
        console.log('Audio fetched, size:', arrayBuffer.byteLength);
        
        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Decode audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log('Audio decoded, duration:', audioBuffer.duration, 'channels:', audioBuffer.numberOfChannels);
        
        // Reverse the audio samples
        const reversedBuffer = audioContext.createBuffer(
          audioBuffer.numberOfChannels,
          audioBuffer.length,
          audioBuffer.sampleRate
        );
        
        // Reverse each channel
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          const reversedData = reversedBuffer.getChannelData(channel);
          
          for (let i = 0; i < channelData.length; i++) {
            reversedData[i] = channelData[channelData.length - 1 - i];
          }
        }
        
        console.log('Audio samples reversed');
        
        // Convert back to WAV blob
        const reversedWav = await audioBufferToWav(reversedBuffer);
        const reversedBlob = new Blob([reversedWav], { type: 'audio/wav' });
        const reversedUri = URL.createObjectURL(reversedBlob);
        
        console.log('Created reversed audio blob URL:', reversedUri);
        
        return reversedUri;
        
      } else {
        // For native, use FileSystem
        console.log('Using native FileSystem reversal');
        
        const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        console.log('Audio file read, size:', audioBase64.length);

        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log('Converted to bytes:', bytes.length);

        const chunkSize = 2;
        const reversedBytes = new Uint8Array(bytes.length);
        
        const headerSize = Math.min(44, bytes.length);
        for (let i = 0; i < headerSize; i++) {
          reversedBytes[i] = bytes[i];
        }
        
        const dataStart = headerSize;
        const dataLength = bytes.length - dataStart;
        
        for (let i = 0; i < dataLength; i += chunkSize) {
          const srcPos = dataStart + i;
          const destPos = bytes.length - chunkSize - i;
          
          for (let j = 0; j < chunkSize && srcPos + j < bytes.length; j++) {
            reversedBytes[destPos + j] = bytes[srcPos + j];
          }
        }
        
        console.log('Audio reversed, converting back to base64');
        
        let binary = '';
        const chunkSizeForConversion = 8192;
        for (let i = 0; i < reversedBytes.length; i += chunkSizeForConversion) {
          const chunk = reversedBytes.slice(i, Math.min(i + chunkSizeForConversion, reversedBytes.length));
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const reversedBase64 = btoa(binary);
        
        console.log('Converted back to base64, size:', reversedBase64.length);
        
        const reversedUri = `${FileSystem.cacheDirectory}reversed_${Date.now()}.m4a`;
        await FileSystem.writeAsStringAsync(reversedUri, reversedBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        console.log('Saved reversed audio to:', reversedUri);
        
        return reversedUri;
      }
      
    } catch (error) {
      console.error('Error reversing audio:', error);
      throw error;
    }
  };

  const playAudio1Backward = async () => {
    console.log('=== playAudio1Backward called ===');
    console.log('audio1:', audio1);
    
    if (!audio1) {
      console.log('No audio1, returning');
      Alert.alert('No Audio', 'Please record audio first');
      return;
    }

    try {
      // If already playing, stop it
      if (isPlayingBackward1 && soundBackward1) {
        console.log('Stopping backward playback');
        await soundBackward1.stopAsync();
        await soundBackward1.unloadAsync();
        setSoundBackward1(null);
        setIsPlayingBackward1(false);
        return;
      }

      console.log('Setting isPlayingBackward1 to true');
      setIsPlayingBackward1(true);

      if (soundBackward1) {
        console.log('Unloading previous backward sound');
        await soundBackward1.unloadAsync();
      }

      console.log('About to reverse audio file:', audio1.uri);
      
      // Reverse the audio
      const reversedUri = await reverseAudioFile(audio1.uri);
      
      console.log('Audio reversed successfully, uri:', reversedUri);

      console.log('Creating sound from reversed URI');
      
      // Play reversed audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: reversedUri },
        { shouldPlay: true }
      );

      console.log('Sound created successfully');
      setSoundBackward1(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        console.log('Playback status:', status);
        if (status.isLoaded && status.didJustFinish) {
          console.log('Playback finished');
          setIsPlayingBackward1(false);
        }
      });
      
      console.log('Playback started');

    } catch (error) {
      console.error('Failed to play audio 1 backward:', error);
      console.error('Error stack:', error.stack);
      Alert.alert('Error', `Failed to play audio backward: ${error.message || error}`);
      setIsPlayingBackward1(false);
    }
  };

  const playAudio2Backward = async () => {
    console.log('=== playAudio2Backward called ===');
    console.log('audio2:', audio2);
    
    if (!audio2) {
      console.log('No audio2, returning');
      Alert.alert('No Audio', 'Please record audio first');
      return;
    }

    try {
      // If already playing, stop it
      if (isPlayingBackward2 && soundBackward2) {
        console.log('Stopping backward playback');
        await soundBackward2.stopAsync();
        await soundBackward2.unloadAsync();
        setSoundBackward2(null);
        setIsPlayingBackward2(false);
        return;
      }

      console.log('Setting isPlayingBackward2 to true');
      setIsPlayingBackward2(true);

      if (soundBackward2) {
        console.log('Unloading previous backward sound');
        await soundBackward2.unloadAsync();
      }

      console.log('About to reverse audio file:', audio2.uri);
      
      // Reverse the audio
      const reversedUri = await reverseAudioFile(audio2.uri);
      
      console.log('Audio reversed successfully, uri:', reversedUri);

      console.log('Creating sound from reversed URI');
      
      // Play reversed audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: reversedUri },
        { shouldPlay: true }
      );

      console.log('Sound created successfully');
      setSoundBackward2(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        console.log('Playback status:', status);
        if (status.isLoaded && status.didJustFinish) {
          console.log('Playback finished');
          setIsPlayingBackward2(false);
        }
      });
      
      console.log('Playback started');

    } catch (error) {
      console.error('Failed to play audio 2 backward:', error);
      console.error('Error stack:', error.stack);
      Alert.alert('Error', `Failed to play audio backward: ${error.message || error}`);
      setIsPlayingBackward2(false);
    }
  };

  const retryRecording1 = () => {
    setAudio1(null);
    setRecordingTime1(0);
  };

  const retryRecording2 = () => {
    setAudio2(null);
    setRecordingTime2(0);
  };

  const newSession = () => {
    // Stop all sounds
    if (sound1) sound1.unloadAsync();
    if (sound2) sound2.unloadAsync();
    if (soundBackward1) soundBackward1.unloadAsync();
    if (soundBackward2) soundBackward2.unloadAsync();
    
    // Clear all recordings
    setAudio1(null);
    setAudio2(null);
    setSound1(null);
    setSound2(null);
    setSoundBackward1(null);
    setSoundBackward2(null);
    setRecordingTime1(0);
    setRecordingTime2(0);
    setIsPlaying1(false);
    setIsPlaying2(false);
    setIsPlayingBackward1(false);
    setIsPlayingBackward2(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const WaveformIndicator = ({ waveAnim }: { waveAnim: Animated.Value }) => {
    // Create staggered animation for each bar
    const bars = [0, 1, 2, 3, 4, 5, 6, 7];
    
    const getBarScale = (index: number) => {
      return waveAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [
          0.3 + (index % 3) * 0.2,
          1.5 + Math.sin(index) * 0.3,
          0.5 + (index % 2) * 0.3
        ],
      });
    };

    const getBarOpacity = (index: number) => {
      return waveAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.4, 1, 0.6],
      });
    };

    return (
      <View style={styles.waveformContainer}>
        {bars.map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                transform: [{ scaleY: getBarScale(index) }],
                opacity: getBarOpacity(index),
                height: 30 + (index % 3) * 10, // Varying base heights
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      {!permissionGranted && (
        <TouchableOpacity onPress={requestPermissions} style={styles.permissionWarning}>
          <Ionicons name="mic-off" size={20} color="#dc2626" />
          <Text style={styles.permissionText}>Microphone access needed</Text>
        </TouchableOpacity>
      )}

      {/* Recording 1 Section */}
      <View style={styles.section}>
        {!audio1 ? (
          <>
            {isRecording1 ? (
              <View style={styles.recordingRow}>
                <View style={styles.waveformSection}>
                  <WaveformIndicator waveAnim={waveAnim1} />
                  <Text style={styles.timerText}>{formatTime(recordingTime1)} / 0:30</Text>
                </View>
                <TouchableOpacity
                  style={[styles.stopButton]}
                  onPress={stopRecording1}
                >
                  <Ionicons name="stop" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.mainButton, styles.recordButton]}
                onPress={startRecording1}
              >
                <Ionicons name="mic" size={32} color="#fff" />
                <Text style={styles.buttonText}>Record</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.smallButton, styles.playButton]}
              onPress={playAudio1}
            >
              <Ionicons name={isPlaying1 ? "stop" : "play"} size={24} color="#fff" />
              <Text style={styles.smallButtonText}>
                {isPlaying1 ? "Stop" : "Play"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.smallButton, styles.retryButton]}
              onPress={retryRecording1}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.smallButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Play Backward Button - for first recording */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            styles.backwardButton,
            !audio1 && styles.disabledButton
          ]}
          onPress={playAudio1Backward}
          disabled={!audio1}
        >
          <Ionicons name={isPlayingBackward1 ? "stop" : "play-back"} size={32} color="#fff" />
          <Text style={styles.buttonText}>
            {isPlayingBackward1 ? "Stop Backward" : "Play First Recording Backward"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recording 2 Section */}
      <View style={styles.section}>
        {!audio2 ? (
          <>
            {isRecording2 ? (
              <View style={styles.recordingRow}>
                <View style={styles.waveformSection}>
                  <WaveformIndicator waveAnim={waveAnim2} />
                  <Text style={styles.timerText}>{formatTime(recordingTime2)} / 0:30</Text>
                </View>
                <TouchableOpacity
                  style={[styles.stopButton]}
                  onPress={stopRecording2}
                >
                  <Ionicons name="stop" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.mainButton, styles.recordButton2]}
                onPress={startRecording2}
              >
                <Ionicons name="mic" size={32} color="#fff" />
                <Text style={styles.buttonText}>Record</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.smallButton, styles.playBackwardButton]}
              onPress={playAudio2Backward}
            >
              <Ionicons name={isPlayingBackward2 ? "stop" : "play-back"} size={24} color="#fff" />
              <Text style={styles.smallButtonText}>
                {isPlayingBackward2 ? "Stop" : "Play Backward"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.smallButton, styles.retryButton2]}
              onPress={retryRecording2}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.smallButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* New Session Button */}
      <TouchableOpacity
        style={styles.newSessionButton}
        onPress={newSession}
      >
        <Ionicons name="add-circle-outline" size={20} color="#6366f1" />
        <Text style={styles.newSessionText}>New Session</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  permissionText: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  waveformSection: {
    flex: 1,
    alignItems: 'center',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 24,
    minHeight: 88,
    gap: 12,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  recordButton: {
    backgroundColor: '#ef4444',
  },
  recordButton2: {
    backgroundColor: '#f59e0b',
  },
  stopButton: {
    backgroundColor: '#64748b',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  playButton: {
    backgroundColor: '#10b981',
  },
  playBackwardButton: {
    backgroundColor: '#f59e0b',
  },
  backwardButton: {
    backgroundColor: '#8b5cf6',
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 56,
  },
  waveBar: {
    width: 5,
    height: 40,
    backgroundColor: '#ef4444',
    borderRadius: 3,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    flex: 1,
    gap: 8,
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08)',
  },
  retryButton: {
    backgroundColor: '#6366f1',
  },
  retryButton2: {
    backgroundColor: '#d97706',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  newSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginTop: 24,
    gap: 8,
  },
  newSessionText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
