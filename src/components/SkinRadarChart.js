import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  Polygon,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { labelPositions, polygonPoints, radarPoint, ringPolygons } from '../domain/radar';
import { colors } from '../theme';

const LEVELS = 4;
const LABEL_OFFSET = 16;
const PADDING = 46;

/**
 * Severity radar: one axis per skin concern, larger area means more to work on.
 * Geometry lives in `src/domain/radar` so it stays testable without rendering.
 */
export default function SkinRadarChart({ metrics, size = 280 }) {
  const center = size / 2;
  const radius = center - PADDING;
  const values = metrics.map((metric) => metric.value);
  const count = metrics.length;
  const rings = ringPolygons(LEVELS, count, radius, center);
  const labels = labelPositions(count, radius, center, LABEL_OFFSET);

  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel={summary(metrics)}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.42" />
            <Stop offset="100%" stopColor={colors.accent} stopOpacity="0.14" />
          </RadialGradient>
        </Defs>

        {rings.map((points, i) => (
          <Polygon
            key={points}
            points={points}
            fill={i % 2 === 0 ? colors.surfaceFaint : colors.surface}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}

        {metrics.map((metric, i) => {
          const edge = radarPoint(i, count, 100, radius, center);
          return (
            <Line
              key={metric.id}
              x1={center}
              y1={center}
              x2={edge.x}
              y2={edge.y}
              stroke={colors.border}
              strokeWidth={1}
            />
          );
        })}

        <Polygon
          points={polygonPoints(values, radius, center)}
          fill="url(#radarFill)"
          stroke={colors.accent}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {metrics.map((metric, i) => {
          const point = radarPoint(i, count, metric.value, radius, center);
          return (
            <Circle
              key={metric.id}
              cx={point.x}
              cy={point.y}
              r={3.5}
              fill={colors.surface}
              stroke={colors.accentDeep}
              strokeWidth={2}
            />
          );
        })}

        {metrics.map((metric, i) => (
          <SvgText
            key={metric.id}
            x={labels[i].x}
            y={labels[i].y}
            fill={colors.textBody}
            fontSize="11"
            fontWeight="700"
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
            fill={colors.textMuted}
            fontSize="10"
            textAnchor={labels[i].anchor}
            alignmentBaseline="middle">
            {metric.value}
          </SvgText>
        ))}
      </Svg>
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
});
