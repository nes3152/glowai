import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BUDGETS } from '../src/domain/budgets';
import {
  centeredColumn,
  colors,
  fonts,
  gradient,
  radius,
  shadow,
  typography,
} from '../src/theme';

export default function BudgetScreen({ route, navigation }) {
  const { photos = [], concerns = [], safetyFlags = [] } = route.params ?? {};
  const [selected, setSelected] = useState(null);
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradient}
      style={[styles.container, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Step 03</Text>
        <Text style={styles.title}>What’s your monthly{'\n'}skincare budget?</Text>
        <Text style={styles.sub}>Your routine total will stay inside this range</Text>
      </View>

      <View style={styles.options}>
        {BUDGETS.map((item) => {
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${item.label}, ${item.sub}`}
              onPress={() => setSelected(item.id)}>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {item.label}
                </Text>
                <Text style={styles.optionSub}>{item.sub}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !selected }}
        disabled={!selected}
        onPress={() =>
          navigation.navigate('Analyzing', { photos, concerns, safetyFlags, budget: selected })
        }>
        <Text style={[styles.buttonText, !selected && styles.buttonTextDisabled]}>
          {selected ? 'Analyze My Skin →' : 'Select a budget'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  header: { ...centeredColumn, marginBottom: 32 },
  eyebrow: { ...typography.label, color: colors.textMuted, marginBottom: 10 },
  title: { ...typography.title, color: colors.text, lineHeight: 34 },
  sub: { ...typography.body, color: colors.textMuted, marginTop: 8 },
  options: { ...centeredColumn, gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  optionSelected: { borderColor: colors.text },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 17, fontFamily: fonts.medium, color: colors.textStrong },
  optionLabelSelected: { color: colors.accentDeep },
  optionSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: colors.text },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.accent },
  button: {
    ...centeredColumn,
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
