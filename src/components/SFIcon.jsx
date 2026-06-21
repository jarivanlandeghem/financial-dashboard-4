export default function SFIcon({ name, size = 24, color = 'currentColor', style = {} }) {
  if (!name) return null;

  // Detect if it's still an emoji (no .svg extension) - render as text fallback
  if (!name.endsWith('.svg')) {
    return <span style={{ fontSize: size * 0.7, lineHeight: 1, ...style }}>{name}</span>;
  }

  return (
    <div style={{
      width: size,
      height: size,
      flexShrink: 0,
      background: color,
      WebkitMask: `url(/icons/${name}) center / contain no-repeat`,
      mask: `url(/icons/${name}) center / contain no-repeat`,
      ...style,
    }} />
  );
}
