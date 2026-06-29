// Backward-compat shim — all geometry now lives in src/ui/geometry/shapeSystem.js
import { squirclePathUniform, squirclePath, squircleClipPath } from '../ui/geometry/shapeSystem.js';

export function getSquirclePath(width, height, radius) {
  return squirclePathUniform(width, height, radius);
}
export function getSquirclePathCorners(width, height, tl = 0, tr = 0, br = 0, bl = 0) {
  return squirclePath(width, height, { topLeft:tl, topRight:tr, bottomRight:br, bottomLeft:bl });
}
export { squircleClipPath as getSquircleClipPath };
