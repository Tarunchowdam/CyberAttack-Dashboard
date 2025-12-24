
export default function Tooltip({ x, y, content }: any) {
  if (!content) return null;
  return (
    <div style={{ position: 'fixed', left: (x || 0) + 10, top: (y || 0) + 10, pointerEvents: 'none' }}>
      <div className="tooltip-card">{content}</div>
    </div>
  );
}
