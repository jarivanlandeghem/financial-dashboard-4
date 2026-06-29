import { useRef, useEffect, useCallback } from 'react';
import { squirclePath, squirclePathUniform, resolveRadius, SMOOTHING } from '../ui/geometry/shapeSystem.js';

/**
 * ShapeWrapper — G2-continuous squircle clip-path + optional SVG hairline border.
 *
 * Props:
 *   radius   — number (px) or token ('card','modal','btn','input','panel', etc.)
 *   smoothing — 0–1 (default 0.6 = Apple continuous)
 *   border   — render SVG hairline overlay (CSS borders get clipped by clip-path)
 *   corners  — { topLeft?, topRight?, bottomRight?, bottomLeft? } px per-corner overrides
 *   as       — HTML element tag (default 'div')
 */
export default function ShapeWrapper({
  radius = 'card',
  smoothing = SMOOTHING,
  border = false,
  corners,
  as: Tag = 'div',
  className,
  style,
  children,
  ...props
}) {
  const ref = useRef(null);
  const pathRef = useRef(null);
  const r = resolveRadius(radius);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (!width || !height) return;

    const pathData = corners
      ? squirclePath(width, height, {
          topLeft:     corners.topLeft     ?? r,
          topRight:    corners.topRight    ?? r,
          bottomRight: corners.bottomRight ?? r,
          bottomLeft:  corners.bottomLeft  ?? r,
          smoothing,
        })
      : squirclePathUniform(width, height, r, smoothing);

    el.style.clipPath = `path('${pathData}')`;
    el.style.webkitClipPath = `path('${pathData}')`;
    el.style.borderRadius = '0';

    if (pathRef.current) pathRef.current.setAttribute('d', pathData);
  }, [r, smoothing, corners]);

  useEffect(() => {
    update();
    const obs = new ResizeObserver(update);
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [update]);

  return (
    <Tag ref={ref} className={className} style={{ position: 'relative', ...style }} {...props}>
      {children}
      {border && (
        <svg
          aria-hidden="true"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'visible' }}
        >
          <path ref={pathRef} fill="none" stroke="var(--glass-border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </Tag>
  );
}
