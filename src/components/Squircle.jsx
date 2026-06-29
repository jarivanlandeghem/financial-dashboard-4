/**
 * <Squircle> — React component wrapper for superellipse shape
 * Use this for new components or when you want explicit control.
 *
 * Usage:
 *   <Squircle radius={20} className="my-card">
 *     content
 *   </Squircle>
 */

import { useRef, useEffect, useCallback } from 'react';
import { getSquirclePath } from '../utils/squircle';

export default function Squircle({
  radius = 20,
  as: Tag = 'div',
  className,
  style,
  children,
  ...props
}) {
  const ref = useRef(null);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    const path = getSquirclePath(width, height, radius);
    el.style.clipPath = `path('${path}')`;
    el.style.webkitClipPath = `path('${path}')`;
    el.style.borderRadius = '0';
  }, [radius]);

  useEffect(() => {
    update();
    const observer = new ResizeObserver(update);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [update]);

  return (
    <Tag ref={ref} className={className} style={style} {...props}>
      {children}
    </Tag>
  );
}
