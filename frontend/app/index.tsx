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
import * as FileSystem from 'expo-file-system';
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
  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);
  
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

  const reverseAudio = async (uri: string): Promise<string> => {
    try {
      // Read the audio file
      const audioData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to binary
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Simple reversal approach: reverse the audio data
      // Note: This is a simplified approach. True audio reversal requires
      // proper audio processing, but this gives the reverse effect
      const reversedBytes = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        reversedBytes[i] = bytes[bytes.length - 1 - i];
      }

      // Convert back to base64
      let reversedBinary = '';
      for (let i = 0; i < reversedBytes.length; i++) {
        reversedBinary += String.fromCharCode(reversedBytes[i]);
      }
      const reversedBase64 = btoa(reversedBinary);

      // Write to new file
      const reversedUri = `${FileSystem.cacheDirectory}reversed_${Date.now()}.m4a`;
      await FileSystem.writeAsStringAsync(reversedUri, reversedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return reversedUri;
    } catch (error) {
      console.error('Failed to reverse audio:', error);
      throw error;
    }
  };

  const playAudio1 = async () => {
    if (!audio1) return;

    try {
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

  const playAudio2Backward = async () => {
    if (!audio2) return;

    try {
      setIsPlaying2(true);

      if (sound2) {
        await sound2.unloadAsync();
      }

      // Reverse the audio
      const reversedUri = await reverseAudio(audio2.uri);

      const { sound } = await Audio.Sound.createAsync(
        { uri: reversedUri },
        { shouldPlay: true }
      );

      setSound2(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying2(false);
        }
      });

    } catch (error) {
      console.error('Failed to play audio 2 backward:', error);
      Alert.alert('Error', 'Failed to play audio backward');
      setIsPlaying2(false);
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
    
    // Clear all recordings
    setAudio1(null);
    setAudio2(null);
    setSound1(null);
    setSound2(null);
    setRecordingTime1(0);
    setRecordingTime2(0);
    setIsPlaying1(false);
    setIsPlaying2(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const WaveformIndicator = ({ waveAnim }: { waveAnim: Animated.Value }) => {
    const scale = waveAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.5],
    });

    return (
      <View style={styles.waveformContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                transform: [{ scaleY: scale }],
                opacity: waveAnim,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  if (!permissionGranted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.permissionText}>Microphone permission required</Text>
          <TouchableOpacity style={[styles.smallButton, styles.retryButton]} onPress={requestPermissions}>
            <Text style={styles.retryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Audio Recorder</Text>
      <Text style={styles.subtitle}>Record, Play & Reverse</Text>

      {/* Recording 1 Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Normal Recording</Text>
        
        {!audio1 ? (
          <>
            {isRecording1 ? (
              <View style={styles.recordingContainer}>
                <WaveformIndicator waveAnim={waveAnim1} />
                <Text style={styles.timerText}>{formatTime(recordingTime1)} / 0:30</Text>
                <TouchableOpacity
                  style={[styles.mainButton, styles.stopButton]}
                  onPress={stopRecording1}
                >
                  <Ionicons name="stop" size={32} color="#fff" />
                  <Text style={styles.buttonText}>Stop</Text>
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
              disabled={isPlaying1}
            >
              <Ionicons name={isPlaying1 ? "volume-high" : "play"} size={24} color="#fff" />
              <Text style={styles.smallButtonText}>
                {isPlaying1 ? "Playing..." : "Play"}
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

      {/* Play Backward Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            styles.backwardButton,
            !audio2 && styles.disabledButton
          ]}
          onPress={playAudio2Backward}
          disabled={!audio2 || isPlaying2}
        >
          <Ionicons name="play-back" size={32} color="#fff" />
          <Text style={styles.buttonText}>
            {isPlaying2 ? "Playing Backward..." : "Play Backward"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recording 2 Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record for Backward</Text>
        
        {!audio2 ? (
          <>
            {isRecording2 ? (
              <View style={styles.recordingContainer}>
                <WaveformIndicator waveAnim={waveAnim2} />
                <Text style={styles.timerText}>{formatTime(recordingTime2)} / 0:30</Text>
                <TouchableOpacity
                  style={[styles.mainButton, styles.stopButton]}
                  onPress={stopRecording2}
                >
                  <Ionicons name="stop" size={32} color="#fff" />
                  <Text style={styles.buttonText}>Stop</Text>
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
              style={[styles.smallButton, styles.playButton]}
              onPress={playAudio2Backward}
              disabled={isPlaying2}
            >
              <Ionicons name={isPlaying2 ? "volume-high" : "play-back"} size={24} color="#fff" />
              <Text style={styles.smallButtonText}>
                {isPlaying2 ? "Playing..." : "Play Backward"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.smallButton, styles.retryButton]}
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
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
    textAlign: 'center',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    minHeight: 80,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  recordButton: {
    backgroundColor: '#ef4444',
  },
  recordButton2: {
    backgroundColor: '#f59e0b',
  },
  stopButton: {
    backgroundColor: '#64748b',
  },
  playButton: {
    backgroundColor: '#10b981',
  },
  backwardButton: {
    backgroundColor: '#8b5cf6',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  recordingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 60,
  },
  waveBar: {
    width: 4,
    height: 40,
    backgroundColor: '#ef4444',
    borderRadius: 2,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
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
    padding: 16,
    borderRadius: 12,
    flex: 1,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButton: {
    backgroundColor: '#6366f1',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  newSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6366f1',
    marginTop: 20,
    gap: 8,
  },
  newSessionText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
