import type { ReactNode } from "react";

export function SwipeRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`no-scrollbar flex touch-pan-x snap-x snap-proximity overflow-x-auto overscroll-x-contain ${className}`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}
