export const RADAR_MAX = 100;

/** Angle of an axis, rotated so the first metric sits at the top of the chart. */
export function axisAngle(index, count) {
  if (count <= 0) throw new Error('radar needs at least one axis');
  return (index * 2 * Math.PI) / count - Math.PI / 2;
}

/** Cartesian position of `value` (0-100) on axis `index`, rounded for stable SVG output. */
export function radarPoint(index, count, value, radius, center) {
  const clamped = Math.max(0, Math.min(RADAR_MAX, value));
  const angle = axisAngle(index, count);
  const distance = (clamped / RADAR_MAX) * radius;
  return {
    x: round(center + distance * Math.cos(angle)),
    y: round(center + distance * Math.sin(angle)),
  };
}

/** `"x,y x,y"` polygon for a list of values, one per axis. */
export function polygonPoints(values, radius, center) {
  return values
    .map((value, index) => radarPoint(index, values.length, value, radius, center))
    .map(({ x, y }) => `${x},${y}`)
    .join(' ');
}

/** Background rings, outermost first, so lighter rings can be drawn on top. */
export function ringPolygons(levels, count, radius, center) {
  return Array.from({ length: levels }, (_, i) => {
    const ringValue = (RADAR_MAX * (levels - i)) / levels;
    return polygonPoints(new Array(count).fill(ringValue), radius, center);
  });
}

/** Label anchors sitting `offset` px outside the outer ring. */
export function labelPositions(count, radius, center, offset) {
  return Array.from({ length: count }, (_, index) => {
    const angle = axisAngle(index, count);
    const x = round(center + (radius + offset) * Math.cos(angle));
    const y = round(center + (radius + offset) * Math.sin(angle));
    const horizontal = Math.cos(angle);
    let anchor = 'middle';
    if (horizontal > 0.1) anchor = 'start';
    else if (horizontal < -0.1) anchor = 'end';
    return { x, y, anchor };
  });
}

function round(value) {
  return Math.round(value * 100) / 100;
}
