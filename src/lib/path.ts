/**
 * Small path/geometry helpers so nodes always sit exactly on the curve they are
 * connected by — instead of hand-guessed coordinates that drift.
 */

export type Point = { x: number; y: number };

/** Point on a quadratic Bézier at t ∈ [0,1]. */
export function quadPoint(p0: Point, p1: Point, p2: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

/** Evenly spaced points along a quadratic Bézier. */
export function quadPoints(p0: Point, p1: Point, p2: Point, count: number): Point[] {
  if (count === 1) return [quadPoint(p0, p1, p2, 0.5)];
  return Array.from({ length: count }, (_, i) => quadPoint(p0, p1, p2, i / (count - 1)));
}

/**
 * Smooth path through a list of points using Catmull-Rom → cubic Bézier conversion.
 * Used for connectors that must pass through every capability node.
 */
export function smoothPath(points: Point[], tension = 0.5): string {
  if (points.length < 2) return "";
  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const c1 = {
      x: p1.x + ((p2.x - p0.x) / 6) * tension * 2,
      y: p1.y + ((p2.y - p0.y) / 6) * tension * 2,
    };
    const c2 = {
      x: p2.x - ((p3.x - p1.x) / 6) * tension * 2,
      y: p2.y - ((p3.y - p1.y) / 6) * tension * 2,
    };

    d += ` C ${round(c1.x)} ${round(c1.y)}, ${round(c2.x)} ${round(c2.y)}, ${round(p2.x)} ${round(p2.y)}`;
  }

  return d;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
