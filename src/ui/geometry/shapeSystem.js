// src/ui/geometry/shapeSystem.js
// Apple UICornerCurve.continuous — G2-curvature-continuous squircle
// Uses figma-squircle (phamfoo) — battle-tested implementation of the Figma
// corner smoothing algorithm. smoothing=0.6 matches Apple UICornerCurve.continuous.

import { getSvgPath } from 'figma-squircle';

export const SMOOTHING = 0.6;

export const SHAPE = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, full: 9999,
};

export const RADII = {
  card: 20, widget: 20, modal: 24, sidebar: 24,
  btn: 20, btnIcon: 20, input: 8, badge: 20,
  navItem: 8, catIcon: 8, logoIcon: 12, tooltip: 8,
  panel: 16, tag: 8, chip: 8,
};

/**
 * Generate SVG path 'd' for a squircle with per-corner radii.
 * Uses the official figma-squircle algorithm (G2-continuous).
 */
export function squirclePath(width, height, {
  topLeft = 0, topRight = 0, bottomRight = 0, bottomLeft = 0,
  smoothing = SMOOTHING,
} = {}) {
  return getSvgPath({
    width,
    height,
    topLeftCornerRadius:     topLeft,
    topRightCornerRadius:    topRight,
    bottomRightCornerRadius: bottomRight,
    bottomLeftCornerRadius:  bottomLeft,
    cornerSmoothing:         smoothing,
    preserveSmoothing:       true,
  });
}

export function squirclePathUniform(width, height, radius, smoothing = SMOOTHING) {
  return getSvgPath({
    width,
    height,
    cornerRadius:    radius,
    cornerSmoothing: smoothing,
    preserveSmoothing: true,
  });
}

export function squircleClipPath(width, height, radius, smoothing = SMOOTHING) {
  return `path('${squirclePathUniform(width, height, radius, smoothing)}')`;
}

export function resolveRadius(token) {
  if (typeof token === 'number') return token;
  return RADII[token] ?? SHAPE[token] ?? 20;
}
