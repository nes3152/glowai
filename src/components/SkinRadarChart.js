import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polygon, Text as SvgText } from 'react-native-svg';

import {
  labelPositions,
  levelTicks,
  polygonPoints,
  radarPoint,
  ringPolygons,
} from '../domain/radar';
import { colors, fonts } from '../theme';

const LEVELS = 5;
const LABEL_OFFSET = 18;
const PADDING = 44;
/** Turns the background grid half a step so its corners sit between the axes. */
const GRID_OFFSET_STEPS = 0.5;

/**
 * Severity radar: one axis per skin concern, a wider shape means more to work on.
 * Layout follows the bklit radar (levelled rings, ring value ticks, points on each
 * vertex); geometry lives in `src/domain/radar` so it stays testable without rendering.
 */
export default function SkinRadarChart({ metrics, baseline, size = 300 }) {
  const center = size / 2;
  const radius = center - PADDING;
  const count = metrics.length;
  const values = metrics.map((metric) => metric.value);
  const rings = ringPolygons(LEVELS, count, radius, center, GRID_OFFSET_STEPS);
  // The outermost tick would collide with the top axis label, so it is dropped.
  const ticks = levelTicks(LEVELS, radius, center).slice(0, -1);
  const labels = labelPositions(count, radius, center, LABEL_OFFSET);
  const baselineValues = typeof baseline === 'number' ? new Array(count).fill(baseline) : null;

  return (
    <View style={styles.wrap}>
      <Svg
        width={size}
        height={size}
        accessibilityRole="image"
        accessibilityLabel={summary(metrics)}>
        {rings.map((points) => (
          <Polygon
            key={points}
            points={points}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        ))}

        {ticks.map((tick) => (
          <SvgText
            key={tick.value}
            x={center + 4}
            y={tick.y}
            fill={colors.textMuted}
            fontSize="8"
            fontFamily={fonts.regular}
            textAnchor="start"
            alignmentBaseline="middle">
            {tick.value}
          </SvgText>
        ))}

        {baselineValues && (
          <Polygon
            points={polygonPoints(baselineValues, radius, center)}
            fill={colors.surfaceStrong}
            fillOpacity={0.7}
            stroke={colors.borderStrong}
            strokeWidth={1}
            strokeDasharray="4 4"
            strokeLinejoin="round"
          />
        )}

        <Polygon
          points={polygonPoints(values, radius, center)}
          fill={colors.accent}
          fillOpacity={0.18}
          stroke={colors.accentDeep}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {metrics.map((metric, i) => {
          const point = radarPoint(i, count, metric.value, radius, center);
          return (
            <Circle key={metric.id} cx={point.x} cy={point.y} r={3.5} fill={colors.accentDeep} />
          );
        })}

        {metrics.map((metric, i) => (
          <SvgText
            key={metric.id}
            x={labels[i].x}
            y={labels[i].y}
            fill={colors.textBody}
            fontSize="11"
            fontFamily={fonts.medium}
            textAnchor={labels[i].anchor}
            alignmentBaseline="middle">
            {metric.label}
          </SvgText>
        ))}

        {metrics.map((metric, i) => (
          <SvgText
            key={`${metric.id}-value`}
            x={labels[i].x}
            y={labels[i].y + 12}
            fill={colors.accentDeep}
            fontSize="11"
            fontFamily={fonts.semibold}
            textAnchor={labels[i].anchor}
            alignmentBaseline="middle">
            {metric.value}
          </SvgText>
        ))}
      </Svg>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accentDeep }]} />
          <Text style={styles.legendText}>Your skin</Text>
        </View>
        {baselineValues && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotBaseline]} />
            <Text style={styles.legendText}>Typical baseline</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function summary(metrics) {
  return `Skin concern radar. ${metrics
    .map((metric) => `${metric.label} ${metric.value} out of 100`)
    .join(', ')}.`;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendDotBaseline: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  legendText: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.medium },
});
