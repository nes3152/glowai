import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { polylinePoints, trendPoints } from '../domain/history';
import { colors, fonts } from '../theme';

const PADDING = 16;
const GUIDES = [25, 50, 75, 100];

function shortDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Skin score over time, oldest on the left. Same monochrome language as the radar:
 * hairline guides, a single ink line, a dot per report with its value above it.
 */
export default function ScoreTrendChart({ series, width = 300, height = 160 }) {
  const points = trendPoints(
    series.map((point) => point.value),
    width,
    height,
    PADDING,
  );
  const innerH = height - PADDING * 2;

  return (
    <View style={styles.wrap}>
      <Svg
        width={width}
        height={height}
        accessibilityRole="image"
        accessibilityLabel={summary(series)}>
        {GUIDES.map((value) => {
          const y = PADDING + innerH - (value / 100) * innerH;
          return (
            <Line
              key={value}
              x1={PADDING}
              x2={width - PADDING}
              y1={y}
              y2={y}
              stroke={colors.border}
              strokeWidth={1}
            />
          );
        })}

        {points.length > 1 && (
          <Polyline
            points={polylinePoints(points)}
            fill="none"
            stroke={colors.text}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.map((point, index) => (
          <React.Fragment key={series[index].id}>
            <Circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill={colors.surface}
              stroke={colors.text}
              strokeWidth={1.5}
            />
            <SvgText
              x={point.x}
              y={point.y - 9}
              fill={colors.text}
              fontSize="10"
              fontFamily={fonts.medium}
              textAnchor="middle">
              {series[index].value}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
      <View style={styles.axis}>
        <Text style={styles.axisLabel}>{shortDate(series[0].createdAt)}</Text>
        {series.length > 1 && (
          <Text style={styles.axisLabel}>{shortDate(series[series.length - 1].createdAt)}</Text>
        )}
      </View>
    </View>
  );
}

function summary(series) {
  if (series.length === 0) return 'No skin score history yet';
  const first = series[0].value;
  const last = series[series.length - 1].value;
  return `Skin score over ${series.length} reports, from ${first} to ${last}`;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: PADDING,
    marginTop: 4,
  },
  axisLabel: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.regular },
});
