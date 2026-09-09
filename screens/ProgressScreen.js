import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScoreTrendChart from '../src/components/ScoreTrendChart';
import { CONCERNS } from '../src/domain/concerns';
import { compareLatest, scoreSeries } from '../src/domain/history';
import { clearHistory, loadHistory } from '../src/services/historyService';
import {
  centeredColumn,
  colors,
  fonts,
  gradient,
  radius,
  shadow,
  typography,
} from '../src/theme';

const concernLabel = (id) => CONCERNS.find((c) => c.id === id)?.short ?? id;

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

export default function ProgressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadHistory().then((history) => {
        if (!cancelled) setEntries(history);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const reset = async () => {
    await clearHistory();
    setEntries([]);
  };

  const comparison = entries ? compareLatest(entries) : null;
  const series = entries ? scoreSeries(entries) : [];

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 60 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Progress</Text>
          <Text style={styles.title}>Your skin, over time.</Text>
          <Text style={styles.sub}>
            {entries && entries.length > 0
              ? `${entries.length} ${entries.length === 1 ? 'report' : 'reports'} saved on this device`
              : 'Reports are saved on this device after each analysis.'}
          </Text>
        </View>

        {entries && entries.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyText}>
              Run your first analysis and it will show up here. Come back in a few weeks to see
              what changed.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              accessibilityRole="button"
              onPress={() => navigation.navigate('Capture')}>
              <Text style={styles.primaryText}>Start an analysis →</Text>
            </TouchableOpacity>
          </View>
        )}

        {series.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Skin score</Text>
            <ScoreTrendChart series={series} />
            {series.length === 1 && (
              <Text style={styles.cardHint}>
                One report so far — the trend line appears from your second analysis.
              </Text>
            )}
          </View>
        )}

        {comparison && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Since last report</Text>
            <Text style={styles.deltaHeadline}>
              {signed(comparison.scoreDelta)}
              <Text style={styles.deltaUnit}> points</Text>
            </Text>
            <Text style={styles.cardHint}>
              {comparison.days === 0
                ? 'Compared with a report from today.'
                : `Compared with a report ${comparison.days} ${comparison.days === 1 ? 'day' : 'days'} ago.`}
            </Text>
            {comparison.improved.length > 0 && (
              <Text style={styles.deltaLine}>
                Improved: {comparison.improved.map((c) => concernLabel(c.id)).join(', ')}
              </Text>
            )}
            {comparison.worsened.length > 0 && (
              <Text style={styles.deltaLine}>
                Needs attention: {comparison.worsened.map((c) => concernLabel(c.id)).join(', ')}
              </Text>
            )}
            {comparison.improved.length === 0 && comparison.worsened.length === 0 && (
              <Text style={styles.deltaLine}>No change in any individual concern.</Text>
            )}
          </View>
        )}

        {entries && entries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Past reports</Text>
            {entries.map((entry, index) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.row}
                accessibilityRole="button"
                onPress={() => navigation.navigate('Result', { analysis: entry, fromHistory: true })}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowDate}>{formatDate(entry.createdAt)}</Text>
                  <Text style={styles.rowMeta}>
                    {entry.skinType}
                    {index === 0 ? ' · latest' : ''}
                  </Text>
                </View>
                <Text style={styles.rowScore}>{entry.score}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.clearButton} accessibilityRole="button" onPress={reset}>
              <Text style={styles.clearText}>Clear history</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.backButton}
          accessibilityRole="button"
          onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.backText}>Back to start</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: centeredColumn,
  header: { paddingHorizontal: 24, marginBottom: 20 },
  eyebrow: { ...typography.label, color: colors.textMuted, marginBottom: 8 },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  card: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 10,
    ...shadow,
  },
  cardLabel: { ...typography.label, color: colors.textMuted },
  cardHint: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  emptyTitle: { ...typography.section, color: colors.text },
  emptyText: { ...typography.body, color: colors.textBody, lineHeight: 22 },
  primaryButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { color: colors.onAccent, fontSize: 16, fontFamily: fonts.semibold },
  deltaHeadline: { fontSize: 32, fontFamily: fonts.semibold, color: colors.text, letterSpacing: -1 },
  deltaUnit: { fontSize: 14, fontFamily: fonts.regular, color: colors.textMuted, letterSpacing: 0 },
  deltaLine: { fontSize: 13, color: colors.textBody, lineHeight: 20 },
  sectionTitle: {
    ...typography.section,
    color: colors.text,
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 12,
  },
  row: {
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
  },
  rowInfo: { flex: 1 },
  rowDate: { fontSize: 15, fontFamily: fonts.medium, color: colors.text },
  rowMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowScore: { fontSize: 20, fontFamily: fonts.semibold, color: colors.accentDeep },
  clearButton: { alignSelf: 'center', marginTop: 20, paddingVertical: 8, paddingHorizontal: 16 },
  clearText: { fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
  backButton: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backText: { color: colors.textStrong, fontSize: 16, fontFamily: fonts.semibold },
});
