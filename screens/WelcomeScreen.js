import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, gradient, radius } from '../src/theme';

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
      <StatusBar barStyle="light-content" />

      <View style={styles.topSection}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.appName}>ifoundit</Text>
        <Text style={styles.tagline}>Snap. Analyze.{'\n'}Find your perfect skincare.</Text>
      </View>

      <View style={styles.stepsContainer}>
        {STEPS.map((item) => (
          <View key={item.text} style={styles.stepRow}>
            <Text style={styles.stepIcon} accessibilityElementsHidden importantForAccessibility="no">
              {item.icon}
            </Text>
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
  emoji: { fontSize: 60, marginBottom: 16 },
  appName: { fontSize: 42, fontWeight: '800', color: colors.text, letterSpacing: 1 },
  tagline: { fontSize: 18, color: colors.textBody, textAlign: 'center', marginTop: 12, lineHeight: 26 },
  stepsContainer: { width: '100%', gap: 16 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  stepIcon: { fontSize: 26, marginRight: 14 },
  stepText: { fontSize: 15, color: colors.textStrong, fontWeight: '500' },
  footer: { width: '100%', alignItems: 'center', gap: 12 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 13 },
  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
});
