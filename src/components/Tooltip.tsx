import React, { useEffect, useRef } from "react";

export default function Tooltip({ x, y, content, setTooltip }: any) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = 0;
      boxRef.current.scrollLeft = 0;
    }
  }, [content]);

  if (!content) return null;

  return (
    <div
      ref={boxRef}
      onMouseEnter={() => setTooltip({ x, y, content })} 
      onMouseLeave={() => setTooltip(null)} 
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: 380,
        height: 250,
        background: "#081424",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        padding: 10,
        fontSize: 13,
        fontWeight: 600,
        color: "#fff",
        zIndex: 9999,
        overflowX: "auto",
        overflowY: "auto",
        pointerEvents: "auto",
        whiteSpace: "normal",
        wordBreak: "break-word",
        boxShadow: "0 4px 14px rgba(0,0,0,0.3)"
      }}
    >
      {content}
    </div>
  );
}
