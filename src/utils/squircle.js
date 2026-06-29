/**
 * Superellipse (squircle) path generator
 * Approximates Apple UICornerCurve.continuous via cubic Bézier curves
 *
 * handleFraction = 0.37  → Apple-like squircle (n≈5 superellipse)
 * handleFraction = 0.4477 → standard circle (CSS border-radius equivalent)
 */

const HANDLE_FRACTION = 0.37;

/**
 * Generate SVG path for a squircle with per-corner radii.
 * Pass radius=0 for a sharp corner.
 */
export function getSquirclePathCorners(width, height, tl = 0, tr = 0, br = 0, bl = 0) {
  const maxR = Math.min(width, height) / 2;
  const clamp = v => Math.min(v, maxR);
  const handle = v => clamp(v) * (1 - HANDLE_FRACTION);

  const RTL = clamp(tl), KTL = handle(tl);
  const RTR = clamp(tr), KTR = handle(tr);
  const RBR = clamp(br), KBR = handle(br);
  const RBL = clamp(bl), KBL = handle(bl);

  const p = [];

  // Start after top-left corner, go clockwise
  p.push(`M ${RTL} 0`);

  // → top-right
  p.push(`L ${width - RTR} 0`);
  if (RTR > 0) p.push(`C ${width - KTR} 0 ${width} ${KTR} ${width} ${RTR}`);
  else         p.push(`L ${width} 0`);

  // → bottom-right
  p.push(`L ${width} ${height - RBR}`);
  if (RBR > 0) p.push(`C ${width} ${height - KBR} ${width - KBR} ${height} ${width - RBR} ${height}`);
  else         p.push(`L ${width} ${height}`);

  // → bottom-left
  p.push(`L ${RBL} ${height}`);
  if (RBL > 0) p.push(`C ${KBL} ${height} 0 ${height - KBL} 0 ${height - RBL}`);
  else         p.push(`L 0 ${height}`);

  // → top-left
  p.push(`L 0 ${RTL}`);
  if (RTL > 0) p.push(`C 0 ${KTL} ${KTL} 0 ${RTL} 0`);
  else         p.push(`L 0 0`);

  p.push('Z');
  return p.join(' ');
}

/**
 * Generate SVG path for a uniform squircle (all corners same radius).
 */
export function getSquirclePath(width, height, radius) {
  return getSquirclePathCorners(width, height, radius, radius, radius, radius);
}

export function getSquircleClipPath(width, height, radius) {
  return `path('${getSquirclePath(width, height, radius)}')`;
}
