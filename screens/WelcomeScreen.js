import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  centeredColumn,
  colors,
  fonts,
  gradient,
  radius,
  shadow,
  typography,
} from '../src/theme';

const STEPS = [
  'Take 3 selfies (front & sides)',
  'We measure seven skin markers',
  'Get your routine, in budget',
];

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradient}
      style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topSection}>
        <Text style={styles.appName}>ifoundit</Text>
        <Text style={styles.tagline}>Skincare,{'\n'}measured.</Text>
      </View>

      <View style={styles.stepsContainer}>
        {STEPS.map((text, index) => (
          <View key={text} style={styles.stepRow}>
            <Text style={styles.stepIndex}>{`0${index + 1}`}</Text>
            <Text style={styles.stepText}>{text}</Text>
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
        <Text style={styles.sub}>Free · Takes 2 minutes</Text>
        <Text style={styles.disclaimer}>
          Cosmetic guidance only — not medical advice or a diagnosis.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 },
  topSection: { ...centeredColumn, alignItems: 'flex-start' },
  appName: { ...typography.label, color: colors.textMuted, marginBottom: 16 },
  tagline: { ...typography.display, color: colors.text, lineHeight: 40 },
  stepsContainer: { ...centeredColumn, borderTopWidth: 1, borderTopColor: colors.border },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 16,
  },
  stepIndex: { ...typography.label, color: colors.textMuted },
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
  buttonText: { color: colors.onAccent, fontSize: 17, fontFamily: fonts.medium },
  sub: { color: colors.textMuted, fontSize: 13 },
  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
