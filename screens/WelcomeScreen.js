import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { centeredColumn, colors, gradient, radius, shadow, typography } from '../src/theme';

const STEPS = [
  { icon: '📸', text: 'Take 3 selfies (front & sides)' },
  { icon: '🔬', text: 'AI analyzes your skin' },
  { icon: '💄', text: 'Get your personalized routine' },
];

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradient}
      style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topSection}>
        <View style={styles.logoBadge}>
          <Text style={styles.emoji}>✦</Text>
        </View>
        <Text style={styles.appName}>ifoundit</Text>
        <Text style={styles.tagline}>Snap. Analyze.{'\n'}Find your perfect skincare.</Text>
      </View>

      <View style={styles.stepsContainer}>
        {STEPS.map((item) => (
          <View key={item.text} style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              <Text
                style={styles.stepIcon}
                accessibilityElementsHidden
                importantForAccessibility="no">
                {item.icon}
              </Text>
            </View>
            <Text style={styles.stepText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Get started"
          onPress={() => navigation.navigate('Capture')}>
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>
        <Text style={styles.sub}>Free · Takes only 2 minutes</Text>
        <Text style={styles.disclaimer}>
          Cosmetic guidance only — not medical advice or a diagnosis.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 },
  topSection: { alignItems: 'center' },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emoji: { fontSize: 34, color: colors.accent },
  appName: { ...typography.display, color: colors.text },
  tagline: {
    fontSize: 17,
    color: colors.textBody,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 26,
  },
  stepsContainer: { ...centeredColumn, gap: 12 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadow,
  },
  stepIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepIcon: { fontSize: 20 },
  stepText: { ...typography.body, color: colors.textStrong, flex: 1 },
  footer: { ...centeredColumn, alignItems: 'center', gap: 10 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    ...shadow,
  },
  buttonText: { color: colors.onAccent, fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  sub: { color: colors.textMuted, fontSize: 13 },
  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
