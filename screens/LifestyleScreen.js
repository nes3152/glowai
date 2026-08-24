import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEALTH_FLAGS, LIFESTYLE_FACTORS } from '../src/domain/lifestyle';
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

export default function LifestyleScreen({ route, navigation }) {
  const { photos = [], concerns = [], safetyFlags = [] } = route.params ?? {};
  const [lifestyle, setLifestyle] = useState([]);
  const [healthFlags, setHealthFlags] = useState([]);
  const insets = useSafeAreaInsets();

  const renderOption = (option, selected, onPress) => (
    <TouchableOpacity
      key={option.id}
      style={[styles.option, selected && styles.optionSelected]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={option.label}
      onPress={onPress}>
      <View style={styles.optionText}>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
          {option.label}
        </Text>
        {option.note && <Text style={styles.optionNote}>{option.note}</Text>}
      </View>
      <View style={[styles.check, selected && styles.checkSelected]}>
        {selected && <Text style={styles.checkMark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 30 }]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Step 03</Text>
        <Text style={styles.title}>A few things{'\n'}a photo can’t see.</Text>
        <Text style={styles.sub}>
          Only used for the supplement and home-device suggestions. Skip anything you’d rather not
          answer.
        </Text>

        <View style={styles.options}>
          {LIFESTYLE_FACTORS.map((factor) =>
            renderOption(factor, lifestyle.includes(factor.id), () =>
              setLifestyle(toggle(lifestyle, factor.id))
            )
          )}
        </View>

        <Text style={styles.sectionTitle}>Anything to rule out?</Text>
        <Text style={styles.sub}>
          These remove suggestions entirely — nothing here is stored or shared.
        </Text>
        <View style={styles.options}>
          {HEALTH_FLAGS.map((flag) =>
            renderOption(flag, healthFlags.includes(flag.id), () =>
              setHealthFlags(toggle(healthFlags, flag.id))
            )
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('Budget', { photos, concerns, safetyFlags, lifestyle, healthFlags })
          }>
          <Text style={styles.buttonText}>
            {lifestyle.length === 0 && healthFlags.length === 0 ? 'Skip for now →' : 'Continue →'}
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
  optionText: { flex: 1 },
  optionLabel: { fontSize: 16, fontFamily: fonts.medium, color: colors.textStrong },
  optionLabelSelected: { color: colors.accentDeep },
  optionNote: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
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
  buttonText: { color: colors.onAccent, fontSize: 17, fontFamily: fonts.semibold, letterSpacing: 0.2 },
});
