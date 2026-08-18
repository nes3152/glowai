import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CONCERNS, SAFETY_FLAGS } from '../src/domain/concerns';
import {
  centeredColumn,
  colors,
  fonts,
  gradient,
  radius,
  shadow,
  typography,
} from '../src/theme';

function toggle(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export default function ConcernScreen({ route, navigation }) {
  const { photos = [] } = route.params ?? {};
  const [concerns, setConcerns] = useState([]);
  const [safetyFlags, setSafetyFlags] = useState([]);
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 30 }]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Step 02</Text>
        <Text style={styles.title}>What would you{'\n'}like to work on?</Text>
        <Text style={styles.sub}>Pick everything that applies — you can change this later.</Text>

        <View style={styles.options}>
          {CONCERNS.map((concern) => {
            const isSelected = concerns.includes(concern.id);
            return (
              <TouchableOpacity
                key={concern.id}
                style={[styles.option, isSelected && styles.optionSelected]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={concern.label}
                onPress={() => setConcerns(toggle(concerns, concern.id))}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {concern.label}
                </Text>
                <View style={[styles.check, isSelected && styles.checkSelected]}>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Anything we should avoid?</Text>
        <Text style={styles.sub}>
          Used to exclude ingredients such as retinoids and acid exfoliants.
        </Text>
        <View style={styles.options}>
          {SAFETY_FLAGS.map((flag) => {
            const isSelected = safetyFlags.includes(flag.id);
            return (
              <TouchableOpacity
                key={flag.id}
                style={[styles.option, isSelected && styles.optionSelected]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={flag.label}
                onPress={() => setSafetyFlags(toggle(safetyFlags, flag.id))}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {flag.label}
                </Text>
                <View style={[styles.check, isSelected && styles.checkSelected]}>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.button, concerns.length === 0 && styles.buttonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: concerns.length === 0 }}
          disabled={concerns.length === 0}
          onPress={() => navigation.navigate('Budget', { photos, concerns, safetyFlags })}>
          <Text style={[styles.buttonText, concerns.length === 0 && styles.buttonTextDisabled]}>
            {concerns.length === 0 ? 'Select at least one' : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { ...centeredColumn, paddingHorizontal: 24, paddingBottom: 40 },
  eyebrow: { ...typography.label, color: colors.textMuted, marginBottom: 10 },
  title: { ...typography.title, color: colors.text, lineHeight: 34 },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 8, marginBottom: 18 },
  sectionTitle: { ...typography.section, color: colors.text, marginTop: 32 },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  optionSelected: { borderColor: colors.text },
  optionLabel: { flex: 1, fontSize: 16, fontFamily: fonts.medium, color: colors.textStrong },
  optionLabelSelected: { color: colors.accentDeep },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
  checkMark: { color: colors.onAccent, fontSize: 12, fontFamily: fonts.semibold },
  button: {
    marginTop: 32,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    ...shadow,
  },
  buttonDisabled: { backgroundColor: colors.disabled, shadowOpacity: 0, elevation: 0 },
  buttonText: { color: colors.onAccent, fontSize: 17, fontFamily: fonts.semibold, letterSpacing: 0.2 },
  buttonTextDisabled: { color: colors.disabledText },
});
