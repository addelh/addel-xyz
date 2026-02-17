"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import rough from "roughjs";

type Size = { width: number; height: number };

type PathData = {
  d: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
};

// A simple PRNG to keep shapes stable across re-renders
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function stableHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Generates a "wonky" rounded rectangle path.
// Instead of perfect arcs and straight lines, we perturb the control points.
function wonkyRoundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  seed: number
): string {
  let s = seed;
  const rand = () => seededRandom(s++);
  const jitter = (amount: number) => (rand() - 0.5) * (amount * 0.6);

  // Perturb the 4 corners slightly
  const tl = { x: x + jitter(4), y: y + jitter(4) };
  const tr = { x: x + w + jitter(4), y: y + jitter(4) };
  const br = { x: x + w + jitter(4), y: y + h + jitter(4) };
  const bl = { x: x + jitter(4), y: y + h + jitter(4) };

  // Perturb the radius for each corner
  const r_tl = r + jitter(5);
  const r_tr = r + jitter(5);
  const r_br = r + jitter(5);
  const r_bl = r + jitter(5);

  // Helper to generate a corner arc (cubic bezier)
  // Standard approx for circle arc: control points at distance (4/3)*tan(pi/8)*r from ends?
  // For 90 degrees, k = 0.5522847498 * r
  const k = 0.55228;

  // Top-Left Corner
  // Start at (x, y+r), curve to (x+r, y)
  // We'll approximate the "start" and "end" of the arc on the sides
  const tl_start = { x: tl.x, y: tl.y + r_tl };
  const tl_end = { x: tl.x + r_tl, y: tl.y };
  const tl_c1 = { x: tl.x, y: tl.y + r_tl - k * r_tl + jitter(3) };
  const tl_c2 = { x: tl.x + r_tl - k * r_tl + jitter(3), y: tl.y };

  // Top Edge (line to Top-Right start)
  const tr_start = { x: tr.x - r_tr, y: tr.y };
  // We can add a midpoint control point to make the line slightly curved
  // but standard SVG L is straight. roughjs will wobble it anyway.
  // Let's stick to straight lines between arc endpoints, roughjs handles the rest.

  // Top-Right Corner
  const tr_end = { x: tr.x, y: tr.y + r_tr };
  const tr_c1 = { x: tr.x - r_tr + k * r_tr + jitter(3), y: tr.y };
  const tr_c2 = { x: tr.x, y: tr.y + r_tr - k * r_tr + jitter(3) };

  // Bottom-Right Corner
  const br_start = { x: br.x, y: br.y - r_br };
  const br_end = { x: br.x - r_br, y: br.y };
  const br_c1 = { x: br.x, y: br.y - r_br + k * r_br + jitter(3) };
  const br_c2 = { x: br.x - r_br + k * r_br + jitter(3), y: br.y };

  // Bottom-Left Corner
  const bl_start = { x: bl.x + r_bl, y: bl.y };
  const bl_end = { x: bl.x, y: bl.y - r_bl };
  const bl_c1 = { x: bl.x + r_bl - k * r_bl + jitter(3), y: bl.y };
  const bl_c2 = { x: bl.x, y: bl.y - r_bl + k * r_bl + jitter(3) };

  return [
    `M ${tl_start.x} ${tl_start.y}`,
    `C ${tl_c1.x} ${tl_c1.y} ${tl_c2.x} ${tl_c2.y} ${tl_end.x} ${tl_end.y}`, // TL Corner
    `L ${tr_start.x} ${tr_start.y}`, // Top Edge
    `C ${tr_c1.x} ${tr_c1.y} ${tr_c2.x} ${tr_c2.y} ${tr_end.x} ${tr_end.y}`, // TR Corner
    `L ${br_start.x} ${br_start.y}`, // Right Edge
    `C ${br_c1.x} ${br_c1.y} ${br_c2.x} ${br_c2.y} ${br_end.x} ${br_end.y}`, // BR Corner
    `L ${bl_start.x} ${bl_start.y}`, // Bottom Edge
    `C ${bl_c1.x} ${bl_c1.y} ${bl_c2.x} ${bl_c2.y} ${bl_end.x} ${bl_end.y}`, // BL Corner
    `Z`,
  ].join(" ");
}

export function CardBorderOverlay() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const idBase = useId().replace(/:/g, "");
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const host = hostRef.current;
    const shell = host?.parentElement;
    if (!host || !shell) return;

    const measure = () => {
      const rect = shell.getBoundingClientRect();
      const w = Math.round(rect.width * 2) / 2;
      const h = Math.round(rect.height * 2) / 2;
      setSize((prev) =>
        prev.width === w && prev.height === h ? prev : { width: w, height: h }
      );
    };

    const schedule = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(shell);
    return () => {
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const { bgPaths, borderPaths } = useMemo(() => {
    const empty: { bgPaths: PathData[]; borderPaths: PathData[] } = {
      bgPaths: [],
      borderPaths: [],
    };
    if (size.width < 48 || size.height < 48) return empty;

    const seed = stableHash(idBase);
    const gen = rough.generator();
    const inset = 12;
    const w = size.width - inset * 2;
    const h = size.height - inset * 2;
    const radius = 22; // Slightly larger radius for that "card" feel

    // Generate the wonky path for the card
    const cardPathD = wonkyRoundedRectPath(inset, inset, w, h, radius, seed);
    
    // Generate a slightly DIFFERENT wonky path for the shadow (so it doesn't just look like a copy-paste)
    // Offset it by ~8px
    const shadowPathD = wonkyRoundedRectPath(inset + 8, inset + 9, w, h, radius, seed + 123);

    // Shadow: Solid, dark, no stroke
    const shadowDrawable = gen.path(shadowPathD, {
      roughness: 0.8, // Less rough fill
      bowing: 0.5,
      stroke: "none",
      strokeWidth: 0,
      fill: "#1a1a1a", // Dark charcoal
      fillStyle: "solid",
      seed: seed + 42,
    });

    // Card Body: White fill, thick stroke, cleaner "comic" look
    const cardDrawable = gen.path(cardPathD, {
      roughness: 0.4, // Much cleaner, less "hairy"
      bowing: 1.2,    // Subtle organic curve
      strokeWidth: 3.5, // Bold ink line
      stroke: "#000000", // Pure black for comic style
      fill: "#ffffff",
      fillStyle: "solid",
      seed,
      disableMultiStroke: true, // Single confident stroke
      disableMultiStrokeFill: true,
    });

    const shadowPaths = gen.toPaths(shadowDrawable) as PathData[];
    const allCardPaths = gen.toPaths(cardDrawable) as PathData[];

    const cardFillPaths = allCardPaths.filter((p) => p.fill !== "none");
    const cardStrokePaths = allCardPaths.filter(
      (p) => p.stroke !== "none" && p.strokeWidth > 0
    );

    return {
      bgPaths: [...shadowPaths, ...cardFillPaths],
      borderPaths: cardStrokePaths,
    };
  }, [idBase, size.width, size.height]);

  if (size.width <= 0 || size.height <= 0) {
    return (
      <div
        ref={hostRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      />
    );
  }

  const viewBox = `0 0 ${size.width} ${size.height}`;

  return (
    <>
      {/* Background Layer: Shadow + White Card Fill */}
      <div
        ref={hostRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      >
        <svg
          className="h-full w-full overflow-visible"
          viewBox={viewBox}
          preserveAspectRatio="none"
          overflow="visible"
        >
          {bgPaths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill={p.fill}
              stroke={p.stroke}
              strokeWidth={p.strokeWidth}
            />
          ))}
        </svg>
      </div>

      {/* Foreground Layer: The sketchy border strokes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 overflow-visible"
      >
        <svg
          className="h-full w-full overflow-visible"
          viewBox={viewBox}
          preserveAspectRatio="none"
          overflow="visible"
        >
          {borderPaths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke={p.stroke}
              strokeWidth={p.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>
    </>
  );
}
