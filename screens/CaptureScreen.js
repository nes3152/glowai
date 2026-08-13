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

import { colors, radius, shadow, typography } from '../src/theme';

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
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 30,
  },
  permissionText: {
    color: colors.textStrong,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  permissionButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.pill,
    ...shadow,
  },
  permissionButtonText: { color: colors.onAccent, fontSize: 16, fontWeight: '700' },
  permissionHint: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 20 },
  progressBar: { flexDirection: 'row', gap: 6, marginBottom: 18 },
  dot: { width: 34, height: 4, borderRadius: 2, backgroundColor: colors.track },
  dotActive: { backgroundColor: colors.accent },
  header: { alignItems: 'center', marginBottom: 18 },
  stepCount: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  stepLabel: { ...typography.title, color: colors.text, marginTop: 6 },
  instruction: { ...typography.caption, color: colors.textBody, marginTop: 6 },
  cameraContainer: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.dark,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  oval: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)', borderStyle: 'dashed' },
  error: { color: colors.accentDeep, fontSize: 13, marginTop: 12 },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: colors.accentFaint,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    ...shadow,
  },
  captureButtonBusy: { opacity: 0.5 },
  captureInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.accent },
  thumbnails: { flexDirection: 'row', gap: 12, marginTop: 18 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceStrong,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  thumbDone: { borderColor: colors.accent },
  thumbImage: { width: 48, height: 48, borderRadius: 12 },
  thumbEmoji: { fontSize: 22 },
  retakeHint: { color: colors.textMuted, fontSize: 12, marginTop: 10 },
});
