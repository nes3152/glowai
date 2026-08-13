import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius } from '../src/theme';

export const STEPS = [
  { label: 'Front', instruction: 'Look straight at the camera', emoji: '😊' },
  { label: 'Left Side', instruction: 'Turn your head slowly to the left', emoji: '😏' },
  { label: 'Right Side', instruction: 'Turn your head slowly to the right', emoji: '😏' },
];

export default function CaptureScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      const nextPhotos = [...photos];
      nextPhotos[step] = photo.uri;
      setPhotos(nextPhotos);

      const missing = STEPS.findIndex((_, i) => !nextPhotos[i]);
      if (missing === -1) {
        navigation.navigate('Concern', { photos: nextPhotos });
      } else {
        setStep(missing);
      }
    } catch {
      setError('Could not take the photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, navigation, photos, step]);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { paddingTop: insets.top + 30 }]}>
        <Text style={styles.permissionText}>
          We need camera access to analyze your skin. Photos stay on your device.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          accessibilityRole="button"
          onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
        {!permission.canAskAgain && (
          <Text style={styles.permissionHint}>
            Camera access is blocked. Enable it for ifoundit in your device settings.
          </Text>
        )}
      </View>
    );
  }

  const current = STEPS[step];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.progressBar}>
        {STEPS.map((s, i) => (
          <View key={s.label} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.header}>
        <Text style={styles.stepCount}>
          Photo {step + 1} of {STEPS.length}
        </Text>
        <Text style={styles.stepLabel}>{current.label}</Text>
        <Text style={styles.instruction}>{current.instruction}</Text>
      </View>

      <View style={[styles.cameraContainer, { width: width * 0.85, height: width * 1.1 }]}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front">
          <View style={styles.overlay}>
            <View
              style={[
                styles.oval,
                { width: width * 0.55, height: width * 0.75, borderRadius: width * 0.4 },
              ]}
            />
          </View>
        </CameraView>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.captureButton, isCapturing && styles.captureButtonBusy]}
        accessibilityRole="button"
        accessibilityLabel={`Take ${current.label} photo`}
        accessibilityState={{ disabled: isCapturing }}
        disabled={isCapturing}
        onPress={takePicture}>
        <View style={styles.captureInner} />
      </TouchableOpacity>

      <View style={styles.thumbnails}>
        {STEPS.map((s, i) => (
          <TouchableOpacity
            key={s.label}
            style={[styles.thumb, photos[i] && styles.thumbDone]}
            accessibilityRole="button"
            accessibilityLabel={photos[i] ? `Retake ${s.label} photo` : `${s.label} photo not taken`}
            disabled={!photos[i]}
            onPress={() => setStep(i)}>
            {photos[i] ? (
              <Image source={{ uri: photos[i] }} style={styles.thumbImage} />
            ) : (
              <Text style={styles.thumbEmoji}>{s.emoji}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.retakeHint}>Tap a thumbnail to retake that angle.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark, alignItems: 'center' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark,
    padding: 30,
  },
  permissionText: { color: colors.text, fontSize: 18, textAlign: 'center', marginBottom: 30 },
  permissionButton: { backgroundColor: colors.accent, padding: 16, borderRadius: radius.lg },
  permissionButtonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  permissionHint: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 20 },
  progressBar: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  dot: { width: 30, height: 4, borderRadius: 2, backgroundColor: colors.track },
  dotActive: { backgroundColor: colors.accent },
  header: { alignItems: 'center', marginBottom: 20 },
  stepCount: { color: colors.textMuted, fontSize: 13 },
  stepLabel: { color: colors.text, fontSize: 26, fontWeight: '700', marginTop: 4 },
  instruction: { color: colors.textBody, fontSize: 14, marginTop: 6 },
  cameraContainer: { borderRadius: radius.pill, overflow: 'hidden' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  oval: { borderWidth: 3, borderColor: colors.accent, borderStyle: 'dashed' },
  error: { color: colors.accent, fontSize: 13, marginTop: 12 },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  captureButtonBusy: { opacity: 0.5 },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent },
  thumbnails: { flexDirection: 'row', gap: 12, marginTop: 20 },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.track,
  },
  thumbDone: { borderColor: colors.accent },
  thumbImage: { width: 46, height: 46, borderRadius: 10 },
  thumbEmoji: { fontSize: 22 },
  retakeHint: { color: colors.textMuted, fontSize: 12, marginTop: 10 },
});
