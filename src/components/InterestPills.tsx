"use client";

import * as React from "react";

type PillItem = {
  label: string;
  emoji: string;
};

const palette = [
  { bg: "#d7f7ff", pop: "#00d4ff" },
  { bg: "#fff0d6", pop: "#ff8a00" },
  { bg: "#e6dcff", pop: "#8b5cf6" },
  { bg: "#dcffe6", pop: "#22c55e" },
  { bg: "#ffe0ef", pop: "#fb7185" },
  { bg: "#fff7a8", pop: "#f59e0b" },
] as const;

export function InterestPills({ items }: { items: readonly PillItem[] }) {
  const [activeLabel, setActiveLabel] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && root.contains(e.target)) return;
      setActiveLabel(null);
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, { capture: true } as any);
    };
  }, []);

  return (
    <div ref={rootRef} className="mt-8 flex flex-wrap gap-2">
      {items.map((item, index) => {
        const colors = palette[index % palette.length];
        const isActive = activeLabel === item.label;

        return (
          <button
            key={item.label}
            type="button"
            className="interest-pill group relative cursor-pointer select-none [font-style:normal]"
            data-active={isActive ? "true" : "false"}
            style={
              {
                "--pill-bg": colors.bg,
                "--pill-pop": colors.pop,
              } as React.CSSProperties
            }
            onClick={() => setActiveLabel((prev) => (prev === item.label ? null : item.label))}
          >
            {item.label}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-1/2 z-10 -translate-y-1/2 text-2xl text-black opacity-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-7 group-hover:translate-x-2 group-hover:rotate-12 group-hover:opacity-100 group-data-[active=true]:-translate-y-7 group-data-[active=true]:translate-x-2 group-data-[active=true]:rotate-12 group-data-[active=true]:opacity-100"
            >
              {item.emoji}
            </span>
          </button>
        );
      })}
    </div>
  );
}
