/**
 * Superellipse (squircle) path generator
 * Approximates Apple UICornerCurve.continuous via cubic Bézier curves
 *
 * The handle factor k = r * (1 - handleFraction):
 *   handleFraction = 0.4477 → standard circle (same as CSS border-radius)
 *   handleFraction = 0.37   → Apple-like squircle (n≈5 superellipse)
 *   handleFraction = 0.28   → very square squircle (n≈8)
 */

const HANDLE_FRACTION = 0.37; // Apple UICornerCurve.continuous approximation

/**
 * Generate SVG path string for a squircle
 * @param {number} width  - element width in px
 * @param {number} height - element height in px
 * @param {number} radius - corner radius in px
 * @returns {string} SVG path data
 */
export function getSquirclePath(width, height, radius) {
  const r = Math.min(radius, Math.min(width, height) / 2);
  const k = r * (1 - HANDLE_FRACTION); // bezier handle offset from corner

  // Each corner: cubic bezier from end-of-straight to start-of-next-straight
  // handle pulls AWAY from center of edge (toward corner), creating superellipse shape
  return [
    `M ${r} 0`,
    `L ${width - r} 0`,
    `C ${width - k} 0 ${width} ${k} ${width} ${r}`,         // top-right
    `L ${width} ${height - r}`,
    `C ${width} ${height - k} ${width - k} ${height} ${width - r} ${height}`, // bottom-right
    `L ${r} ${height}`,
    `C ${k} ${height} 0 ${height - k} 0 ${height - r}`,     // bottom-left
    `L 0 ${r}`,
    `C 0 ${k} ${k} 0 ${r} 0`,                               // top-left
    'Z',
  ].join(' ');
}

/**
 * Generate CSS clip-path value
 */
export function getSquircleClipPath(width, height, radius) {
  return `path('${getSquirclePath(width, height, radius)}')`;
}
