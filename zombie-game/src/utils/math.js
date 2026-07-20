/**
 * Mathematical utility functions
 */

/**
 * Calculate distance between two points
 */
export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Linear interpolation between a and b by t (0-1)
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Ease-in quadratic
 */
export function easeInQuad(t) {
  return t * t;
}

/**
 * Ease-out quadratic
 */
export function easeOutQuad(t) {
  return t * (2 - t);
}

/**
 * Ease-in-out quadratic
 */
export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Generate random integer between min and max inclusive
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if point (x,y) is within circle at (cx,cy) with radius r
 */
export function pointInCircle(x, y, cx, cy, r) {
  return distance(x, y, cx, cy) <= r;
}

/**
 * Check if point (x,y) is within rectangle
 */
export function pointInRect(x, y, rx, ry, rw, rh) {
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}

/**
 * Get angle from (x1,y1) to (x2,y2) in radians
 */
export function angleTo(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Get direction vector from (x1,y1) to (x2,y2)
 */
export function directionTo(x1, y1, x2, y2) {
  const angle = angleTo(x1, y1, x2, y2);
  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
}
