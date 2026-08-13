import React, { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { analyzeSkin } from '../src/services/analysisService';
import { centeredColumn, colors, gradient, radius, shadow, typography } from '../src/theme';

const STEPS = [
  { text: 'Scanning your skin tone...', emoji: '🔍' },
  { text: 'Detecting skin concerns...', emoji: '🧬' },
  { text: 'Analyzing ingredients...', emoji: '🔬' },
  { text: 'Finding K-Beauty matches...', emoji: '🇰🇷' },
  { text: 'Building your routine...', emoji: '✨' },
];

/** Keeps the animation on screen long enough to read, even on a fast response. */
export const MIN_DISPLAY_MS = 1800;

export default function AnalyzingScreen({ route, navigation }) {
  const { photos = [], concerns = [], safetyFlags = [], budget } = route.params ?? {};
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const progress = useMemo(() => new Animated.Value(0), []);
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    let cancelled = false;
    progress.setValue(0);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    const progressAnimation = Animated.timing(progress, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: false,
    });
    pulse.start();
    progressAnimation.start();

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) return prev;
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        return prev + 1;
      });
    }, 900);

    const startedAt = Date.now();
    analyzeSkin({ photos, concerns, budget, safetyFlags })
      .then((analysis) => {
        const remaining = MIN_DISPLAY_MS - (Date.now() - startedAt);
        const navigate = () => {
          if (!cancelled) navigation.replace('Result', { analysis });
        };
        if (remaining > 0) setTimeout(navigate, remaining);
        else navigate();
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      });

    return () => {
      cancelled = true;
      pulse.stop();
      progressAnimation.stop();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const retry = () => {
    setError(null);
    setCurrentStep(0);
    setAttempt((n) => n + 1);
  };

  if (error) {
    return (
      <LinearGradient colors={gradient} style={styles.container}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.title}>We couldn’t finish</Text>
        <Text style={styles.stepText}>{error.message}</Text>
        <TouchableOpacity
          style={styles.button}
          accessibilityRole="button"
          onPress={retry}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          accessibilityRole="button"
          onPress={() => navigation.navigate('Capture')}>
          <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Retake photos</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <Animated.View style={[styles.pulseOuter, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.pulseInner}>
          <Text style={styles.pulseEmoji}>🧴</Text>
        </View>
      </Animated.View>

      <Text style={styles.title}>Analyzing your skin</Text>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.stepEmoji}>{STEPS[currentStep].emoji}</Text>
        <Text style={styles.stepText} accessibilityLiveRegion="polite">
          {STEPS[currentStep].text}
        </Text>
      </Animated.View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <View style={styles.doneList}>
        {STEPS.slice(0, currentStep).map((s) => (
          <Text key={s.text} style={styles.doneText}>
            ✓ {s.text}
          </Text>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  pulseOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  pulseInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accentFaint,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow,
  },
  pulseEmoji: { fontSize: 44 },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  title: { ...typography.title, color: colors.text, marginBottom: 20 },
  stepEmoji: { fontSize: 28, textAlign: 'center', marginBottom: 8 },
  stepText: { ...typography.body, color: colors.textBody, textAlign: 'center', marginBottom: 32 },
  progressTrack: {
    ...centeredColumn,
    height: 6,
    backgroundColor: colors.track,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  doneList: { ...centeredColumn, alignItems: 'flex-start', gap: 8 },
  doneText: { fontSize: 13, color: colors.success },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 12,
    ...shadow,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: { color: colors.onAccent, fontSize: 16, fontWeight: '700' },
  buttonSecondaryText: { color: colors.textStrong },
});
