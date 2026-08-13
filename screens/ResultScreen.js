import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatPrice } from '../src/domain/money';
import { centeredColumn, colors, gradient, radius, shadow, typography } from '../src/theme';

function label(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export default function ResultScreen({ route, navigation }) {
  const { analysis } = route.params ?? {};
  const insets = useSafeAreaInsets();

  if (!analysis) {
    return (
      <LinearGradient colors={gradient} style={styles.emptyContainer}>
        <Text style={styles.sub}>No analysis to show.</Text>
        <TouchableOpacity
          style={styles.retakeButton}
          accessibilityRole="button"
          onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.retakeText}>Start over</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const { scores, score, skinType, confidence, recommendations } = analysis;
  const { cosmetics, cosmeticsTotal, skippedSteps, warnings, supplements, devices } =
    recommendations;

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 60 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Skin Report ✨</Text>
          <Text style={styles.sub}>
            Based on your 3-angle analysis · confidence {Math.round(confidence * 100)}%
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreLabel}>Skin Score</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.skinType}>Skin Type</Text>
            <Text style={styles.skinTypeValue}>{skinType}</Text>
            <View style={styles.bars}>
              {Object.entries(scores).map(([key, val]) => (
                <View key={key} style={styles.barRow}>
                  <Text style={styles.barLabel}>{label(key)}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${val}%`, backgroundColor: val > 60 ? colors.accent : colors.success },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {warnings.length > 0 && (
          <View style={styles.warningBox}>
            {warnings.map((warning) => (
              <Text key={warning} style={styles.warningText}>
                ⚠ {warning}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Your Routine</Text>
        <Text style={styles.sectionSub}>
          {`${cosmetics.length} products · ${formatPrice({
            amount: cosmeticsTotal,
            currency: 'USD',
          })} total, inside your budget`}
        </Text>

        {cosmetics.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productTop}>
              <Text style={styles.productEmoji}>{product.emoji}</Text>
              <View style={styles.productInfo}>
                <View style={styles.productTopRow}>
                  <Text style={styles.productStep}>{product.stepLabel}</Text>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badge}>{product.badge}</Text>
                  </View>
                </View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>
              </View>
              <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
            </View>
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>{product.reason}</Text>
            </View>
          </View>
        ))}

        {skippedSteps.length > 0 && (
          <Text style={styles.note}>
            Skipped to stay in budget: {skippedSteps.join(', ')}. Raise your budget to add them.
          </Text>
        )}

        {supplements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Supplements to consider</Text>
            <Text style={styles.sectionSub}>
              General wellness suggestions — not a treatment. Talk to a professional before starting.
            </Text>
            {supplements.map((supplement) => (
              <View key={supplement.id} style={styles.productCard}>
                <View style={styles.productTop}>
                  <Text style={styles.productEmoji}>{supplement.emoji}</Text>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{supplement.name}</Text>
                    <Text style={styles.productBrand}>{supplement.reason}</Text>
                  </View>
                  <Text style={styles.productPrice}>{formatPrice(supplement.price)}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {devices.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Home devices</Text>
            <Text style={styles.sectionSub}>Optional add-ons, priced separately from your routine.</Text>
            {devices.map((device) => (
              <View key={device.id} style={styles.productCard}>
                <View style={styles.productTop}>
                  <Text style={styles.productEmoji}>{device.emoji}</Text>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{device.name}</Text>
                    <Text style={styles.productBrand}>{device.reason}</Text>
                    {device.requiresCertification && (
                      <Text style={styles.cardNote}>
                        Check that this device is certified for sale in your country.
                      </Text>
                    )}
                  </View>
                  <Text style={styles.productPrice}>{formatPrice(device.price)}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={styles.disclaimer}>
          ifoundit gives cosmetic guidance only. It is not medical advice, a diagnosis, or a
          treatment plan.
        </Text>

        <TouchableOpacity
          style={styles.retakeButton}
          accessibilityRole="button"
          onPress={() => navigation.navigate('Capture')}>
          <Text style={styles.retakeText}>Retake photos</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: centeredColumn,
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  header: { paddingHorizontal: 24, marginBottom: 20 },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  scoreCard: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 28,
    gap: 16,
    ...shadow,
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: { fontSize: 28, fontWeight: '800', color: colors.accentDeep },
  scoreLabel: { fontSize: 10, color: colors.textMuted },
  scoreInfo: { flex: 1 },
  skinType: { fontSize: 12, color: colors.textMuted },
  skinTypeValue: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
  bars: { gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 11, color: colors.textMuted, width: 70 },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.track,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 2 },
  warningBox: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  warningText: { color: colors.warning, fontSize: 12, lineHeight: 18 },
  sectionTitle: {
    ...typography.section,
    color: colors.text,
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionSub: { fontSize: 13, color: colors.textMuted, paddingHorizontal: 24, marginBottom: 16 },
  productCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadow,
  },
  productTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  productEmoji: { fontSize: 32, marginTop: 2 },
  productInfo: { flex: 1 },
  productTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  productStep: { fontSize: 11, color: colors.accent, fontWeight: '700', textTransform: 'uppercase' },
  badgeContainer: {
    backgroundColor: colors.accentFaint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badge: { fontSize: 10, color: colors.accent, fontWeight: '600' },
  productName: { fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 20 },
  productBrand: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  productPrice: { fontSize: 18, fontWeight: '800', color: colors.accentDeep },
  reasonBox: {
    marginTop: 12,
    backgroundColor: colors.surfaceFaint,
    borderRadius: radius.sm,
    padding: 10,
  },
  reasonText: { fontSize: 12, color: colors.textBody, lineHeight: 18 },
  note: { fontSize: 12, color: colors.textMuted, paddingHorizontal: 24, marginBottom: 12 },
  cardNote: { fontSize: 11, color: colors.warning, marginTop: 6, lineHeight: 16 },
  disclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    paddingHorizontal: 24,
    marginTop: 20,
    lineHeight: 16,
  },
  retakeButton: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retakeText: { color: colors.textStrong, fontSize: 16, fontWeight: '700' },
});
