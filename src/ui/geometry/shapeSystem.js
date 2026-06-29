// src/ui/geometry/shapeSystem.js
// Apple UICornerCurve.continuous — G2-curvature-continuous squircle
// Algorithm: Figma corner smoothing (figma-squircle by phamfoo), smoothing=0.6

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

function mkCorner(r, s, w, h) {
  if (!r || r <= 0) return null;
  r = Math.min(r, Math.min(w, h) / 2);
  const p = Math.min((1 + s) * r, Math.min(w, h) / 2);
  const arcDeg = 90 * (1 - s);
  const arcLen = Math.sin((arcDeg / 2) * (Math.PI / 180)) * r * Math.SQRT2;
  const alpha = ((90 - arcDeg) / 2) * (Math.PI / 180);
  const beta = (45 * s) * (Math.PI / 180);
  const b = Math.tan(alpha) * r;
  const c = arcLen * Math.cos(beta);
  const d = c * Math.tan(beta);
  return { r, p, b, c, d };
}

const f4 = v => +v.toFixed(4);

function appendCorner(seg, tx, out) {
  if (!seg) return;
  const { p, b, c, d, r } = seg;
  const t = (x, y) => `${f4(tx(x, y)[0])} ${f4(tx(x, y)[1])}`;
  // 2 cubic Béziers per corner — G2-continuous (curvature ramps 0→arc→0):
  // Bézier 1 (ramp-in): straight edge → mid-curve
  out.push(`C ${t(-p+b, 0)} ${t(-r+c+d, d)} ${t(-r+c, r-c-d)}`);
  // Bézier 2 (arc + ramp-out): mid-curve → next straight edge
  out.push(`C ${t(-d, r-c)} ${t(0, p-r)} ${t(0, p)}`);
}

/**
 * Generate SVG path 'd' for a squircle with per-corner radii.
 * Each non-zero corner uses 2 cubic Béziers for G2 curvature continuity.
 * Zero = sharp corner.
 */
export function squirclePath(width, height, {
  topLeft = 0, topRight = 0, bottomRight = 0, bottomLeft = 0,
  smoothing = SMOOTHING,
} = {}) {
  const w = width, h = height, s = smoothing;
  const TL = mkCorner(topLeft,    s, w, h);
  const TR = mkCorner(topRight,   s, w, h);
  const BR = mkCorner(bottomRight,s, w, h);
  const BL = mkCorner(bottomLeft, s, w, h);
  const o = [];

  // Start: after top-left corner, on top edge
  o.push(`M ${f4(TL ? TL.p : 0)} 0`);

  // TOP-RIGHT corner at (w,0): entering ←, exiting ↓
  // Transform: abstract (x,y) → SVG (w+x, y)
  if (TR) {
    o.push(`L ${f4(w - TR.p)} 0`);
    appendCorner(TR, (x, y) => [w + x, y], o);
  } else {
    o.push(`L ${f4(w)} 0`);
  }

  // BOTTOM-RIGHT corner at (w,h): entering ↑, exiting ←
  // Transform: abstract (x,y) → SVG (w-y, h+x)
  if (BR) {
    o.push(`L ${f4(w)} ${f4(h - BR.p)}`);
    appendCorner(BR, (x, y) => [w - y, h + x], o);
  } else {
    o.push(`L ${f4(w)} ${f4(h)}`);
  }

  // BOTTOM-LEFT corner at (0,h): entering →, exiting ↑
  // Transform: abstract (x,y) → SVG (-x, h-y)
  if (BL) {
    o.push(`L ${f4(BL.p)} ${f4(h)}`);
    appendCorner(BL, (x, y) => [-x, h - y], o);
  } else {
    o.push(`L 0 ${f4(h)}`);
  }

  // TOP-LEFT corner at (0,0): entering ↓, exiting →
  // Transform: abstract (x,y) → SVG (y, -x)
  if (TL) {
    o.push(`L 0 ${f4(TL.p)}`);
    appendCorner(TL, (x, y) => [y, -x], o);
  } else {
    o.push(`L 0 0`);
  }

  o.push('Z');
  return o.join(' ');
}

export function squirclePathUniform(width, height, radius, smoothing = SMOOTHING) {
  return squirclePath(width, height, {
    topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius,
    smoothing,
  });
}

export function squircleClipPath(width, height, radius, smoothing = SMOOTHING) {
  return `path('${squirclePathUniform(width, height, radius, smoothing)}')`;
}

export function resolveRadius(token) {
  if (typeof token === 'number') return token;
  return RADII[token] ?? SHAPE[token] ?? 20;
}
