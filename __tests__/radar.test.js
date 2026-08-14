import {
  RADAR_MAX,
  axisAngle,
  labelPositions,
  levelTicks,
  polygonPoints,
  radarPoint,
  ringPolygons,
} from '../src/domain/radar';

describe('axisAngle', () => {
  it('puts the first axis at the top', () => {
    expect(axisAngle(0, 7)).toBeCloseTo(-Math.PI / 2);
  });

  it('spreads axes evenly around the circle', () => {
    const count = 6;
    const step = axisAngle(1, count) - axisAngle(0, count);
    expect(step).toBeCloseTo((2 * Math.PI) / count);
  });

  it('offsets the whole ring by a fraction of one step', () => {
    const count = 4;
    expect(axisAngle(0, count, 0.5)).toBeCloseTo(axisAngle(0, count) + Math.PI / count);
  });

  it('rejects an empty chart', () => {
    expect(() => axisAngle(0, 0)).toThrow(/at least one axis/);
  });
});

describe('radarPoint', () => {
  it('maps the max value to the outer ring straight above the center', () => {
    expect(radarPoint(0, 4, RADAR_MAX, 50, 60)).toEqual({ x: 60, y: 10 });
  });

  it('maps zero to the center', () => {
    expect(radarPoint(2, 5, 0, 50, 60)).toEqual({ x: 60, y: 60 });
  });

  it('scales linearly with the value', () => {
    expect(radarPoint(0, 4, 50, 50, 60)).toEqual({ x: 60, y: 35 });
  });

  it('clamps values outside 0-100', () => {
    expect(radarPoint(0, 4, 140, 50, 60)).toEqual(radarPoint(0, 4, 100, 50, 60));
    expect(radarPoint(0, 4, -20, 50, 60)).toEqual(radarPoint(0, 4, 0, 50, 60));
  });
});

describe('polygonPoints', () => {
  it('emits one "x,y" pair per value', () => {
    const points = polygonPoints([100, 100, 100, 100], 50, 60).split(' ');
    expect(points).toEqual(['60,10', '110,60', '60,110', '10,60']);
  });
});

describe('ringPolygons', () => {
  it('returns one polygon per level, outermost first', () => {
    const rings = ringPolygons(4, 4, 50, 60);
    expect(rings).toHaveLength(4);
    expect(rings[0]).toBe(polygonPoints([100, 100, 100, 100], 50, 60));
    expect(rings[3]).toBe(polygonPoints([25, 25, 25, 25], 50, 60));
  });

  it('can rotate the grid between the axes', () => {
    const [outer] = ringPolygons(1, 4, 50, 60, 0.5);
    expect(outer).toBe(polygonPoints([100, 100, 100, 100], 50, 60, 0.5));
    expect(outer).not.toBe(polygonPoints([100, 100, 100, 100], 50, 60));
  });
});

describe('levelTicks', () => {
  it('labels each ring up the top axis', () => {
    expect(levelTicks(5, 50, 60)).toEqual([
      { value: 20, y: 50 },
      { value: 40, y: 40 },
      { value: 60, y: 30 },
      { value: 80, y: 20 },
      { value: 100, y: 10 },
    ]);
  });
});

describe('labelPositions', () => {
  it('places labels outside the outer ring', () => {
    const [top] = labelPositions(4, 50, 60, 10);
    expect(top).toEqual({ x: 60, y: 0, anchor: 'middle' });
  });

  it('anchors text away from the chart on each side', () => {
    const [, right, , left] = labelPositions(4, 50, 60, 10);
    expect(right.anchor).toBe('start');
    expect(left.anchor).toBe('end');
  });
});
