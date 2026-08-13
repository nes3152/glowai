import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BUDGETS } from '../src/domain/budgets';
import { colors, gradient, radius } from '../src/theme';

export default function BudgetScreen({ route, navigation }) {
  const { photos = [], concerns = [], safetyFlags = [] } = route.params ?? {};
  const [selected, setSelected] = useState(null);
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradient}
      style={[styles.container, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
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
              <Text style={styles.emoji}>{item.emoji}</Text>
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
        <Text style={styles.buttonText}>{selected ? 'Analyze My Skin →' : 'Select a budget'}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  header: { marginBottom: 32 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, lineHeight: 38 },
  sub: { fontSize: 15, color: colors.textMuted, marginTop: 8 },
  options: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  emoji: { fontSize: 28, marginRight: 14 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 17, fontWeight: '700', color: colors.textStrong },
  optionLabelSelected: { color: colors.text },
  optionSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: colors.accent },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: colors.disabled },
  buttonText: { color: colors.text, fontSize: 17, fontWeight: '700' },
});
