"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { OpSet } from "roughjs/bin/core";
import rough from "roughjs/bin/rough";

type Size = {
  width: number;
  height: number;
};

type StrokeLinecap = "round" | "square" | "butt";

type StrokePath = {
  key: string;
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  dasharray?: string;
  dashoffset?: number;
  linecap: StrokeLinecap;
  jitterX: number;
  jitterY: number;
};

type StrokePass = {
  seed: number;
  stroke: string;
  strokeWidth: number;
  roughness: number;
  bowing: number;
  maxRandomnessOffset: number;
  opacity: number;
  dasharray?: string;
  linecap: StrokeLinecap;
  jitter: number;
};

const generator = rough.generator();

const MAIN_STROKES: StrokePass[] = [
  {
    seed: 10241,
    stroke: "#1f1f1f",
    strokeWidth: 2.3,
    roughness: 2.05,
    bowing: 2.25,
    maxRandomnessOffset: 2.9,
    opacity: 0.94,
    linecap: "round",
    jitter: 0.22,
  },
  {
    seed: 10242,
    stroke: "#222222",
    strokeWidth: 1.72,
    roughness: 2.45,
    bowing: 2.95,
    maxRandomnessOffset: 3.3,
    opacity: 0.67,
    dasharray: "18 7 2 8",
    linecap: "butt",
    jitter: 0.34,
  },
  {
    seed: 10243,
    stroke: "#252525",
    strokeWidth: 1.26,
    roughness: 2.2,
    bowing: 2.25,
    maxRandomnessOffset: 2.85,
    opacity: 0.5,
    dasharray: "7 4 1.5 6",
    linecap: "square",
    jitter: 0.28,
  },
];

const OFFSET_STROKES: StrokePass[] = [
  {
    seed: 20481,
    stroke: "#262626",
    strokeWidth: 1.95,
    roughness: 2.25,
    bowing: 2.7,
    maxRandomnessOffset: 3.25,
    opacity: 0.49,
    dasharray: "20 10 3 11",
    linecap: "butt",
    jitter: 0.4,
  },
  {
    seed: 20482,
    stroke: "#2b2b2b",
    strokeWidth: 1.36,
    roughness: 2.55,
    bowing: 3.1,
    maxRandomnessOffset: 3.5,
    opacity: 0.34,
    dasharray: "9 5 2 7",
    linecap: "round",
    jitter: 0.48,
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function stableNoise(seed: number, pathIndex: number, salt: number) {
  const noise = Math.sin((seed + pathIndex * 13.37 + salt * 101.19) * 12.9898) * 43758.5453;
  return noise - Math.floor(noise);
}

function roundedRectPath(x: number, y: number, width: number, height: number, radius: number) {
  const r = clamp(radius, 0, Math.min(width, height) / 2);
  const right = x + width;
  const bottom = y + height;

  return [
    `M ${x + r} ${y}`,
    `H ${right - r}`,
    `Q ${right} ${y} ${right} ${y + r}`,
    `V ${bottom - r}`,
    `Q ${right} ${bottom} ${right - r} ${bottom}`,
    `H ${x + r}`,
    `Q ${x} ${bottom} ${x} ${bottom - r}`,
    `V ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    "Z",
  ].join(" ");
}

function opacityVariance(baseOpacity: number, seed: number, pathIndex: number) {
  // Deterministic tiny variance so hydration stays stable.
  const normalized = stableNoise(seed, pathIndex, 1);
  const drift = (normalized - 0.5) * 0.2;
  return clamp(baseOpacity + drift, 0.16, 1);
}

function jitterVariance(jitter: number, seed: number, pathIndex: number, axisSalt: number) {
  const normalized = stableNoise(seed, pathIndex, axisSalt);
  return Number(((normalized - 0.5) * jitter).toFixed(3));
}

function dashOffsetVariance(seed: number, pathIndex: number) {
  const normalized = stableNoise(seed, pathIndex, 5);
  return Number(((normalized - 0.5) * 16).toFixed(3));
}

function opSetToPath(set: OpSet) {
  if (set.type !== "path") return "";
  return generator.opsToPath(set, 2);
}

function createStrokePaths({
  x,
  y,
  width,
  height,
  radius,
  passes,
  keyPrefix,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  passes: StrokePass[];
  keyPrefix: string;
}) {
  const shapePath = roundedRectPath(x, y, width, height, radius);
  const paths: StrokePath[] = [];

  passes.forEach((pass, passIndex) => {
    const drawable = generator.path(shapePath, {
      fill: "none",
      stroke: "#2d2d2d",
      seed: pass.seed,
      strokeWidth: pass.strokeWidth,
      roughness: pass.roughness,
      bowing: pass.bowing,
      maxRandomnessOffset: pass.maxRandomnessOffset,
      disableMultiStroke: false,
      preserveVertices: false,
      curveFitting: 0.96,
    });

    drawable.sets.forEach((set, setIndex) => {
      const d = opSetToPath(set);
      if (!d) return;

      paths.push({
        key: `${keyPrefix}-${passIndex}-${setIndex}`,
        d,
        stroke: pass.stroke,
        strokeWidth: pass.strokeWidth,
        opacity: opacityVariance(pass.opacity, pass.seed, setIndex),
        dasharray: pass.dasharray,
        dashoffset: pass.dasharray ? dashOffsetVariance(pass.seed, setIndex) : undefined,
        linecap: pass.linecap,
        jitterX: jitterVariance(pass.jitter, pass.seed, setIndex, 7),
        jitterY: jitterVariance(pass.jitter, pass.seed, setIndex, 11),
      });
    });
  });

  return paths;
}

export function CardBorderOverlay() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const host = hostRef.current;
    const shell = host?.parentElement;
    if (!host || !shell) return;

    const measure = () => {
      const rect = shell.getBoundingClientRect();
      const nextWidth = Math.round(rect.width * 2) / 2;
      const nextHeight = Math.round(rect.height * 2) / 2;

      setSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev;
        }
        return { width: nextWidth, height: nextHeight };
      });
    };

    const scheduleMeasure = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(measure);
    };

    measure();
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(shell);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const { mainPaths, offsetPaths } = useMemo(() => {
    const MIN_SIZE = 48;
    if (size.width < MIN_SIZE || size.height < MIN_SIZE) {
      return { mainPaths: [] as StrokePath[], offsetPaths: [] as StrokePath[] };
    }

    const mainInset = 11.2;
    const mainWidth = Math.max(16, size.width - mainInset * 2);
    const mainHeight = Math.max(16, size.height - mainInset * 2);
    const mainRadius = clamp(Math.min(mainWidth, mainHeight) * 0.14, 19, 30);

    const offsetShiftX = 5.2;
    const offsetShiftY = 5.6;
    const offsetWidth = Math.max(14, mainWidth - 0.8);
    const offsetHeight = Math.max(14, mainHeight - 0.8);

    return {
      offsetPaths: createStrokePaths({
        x: mainInset + offsetShiftX,
        y: mainInset + offsetShiftY,
        width: offsetWidth,
        height: offsetHeight,
        radius: mainRadius + 1.1,
        passes: OFFSET_STROKES,
        keyPrefix: "offset",
      }),
      mainPaths: createStrokePaths({
        x: mainInset,
        y: mainInset,
        width: mainWidth,
        height: mainHeight,
        radius: mainRadius,
        passes: MAIN_STROKES,
        keyPrefix: "main",
      }),
    };
  }, [size.height, size.width]);

  if (size.width <= 0 || size.height <= 0) {
    return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" />;
  }

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
    >
      <svg
        className="h-full w-full overflow-visible"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
        overflow="visible"
      >
        <g>
          {offsetPaths.map((path) => (
            <path
              key={path.key}
              d={path.d}
              fill="none"
              stroke={path.stroke}
              strokeOpacity={path.opacity}
              strokeWidth={path.strokeWidth}
              strokeDasharray={path.dasharray}
              strokeDashoffset={path.dashoffset}
              strokeLinecap={path.linecap}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              transform={`translate(${path.jitterX} ${path.jitterY})`}
            />
          ))}
        </g>
        <g>
          {mainPaths.map((path) => (
            <path
              key={path.key}
              d={path.d}
              fill="none"
              stroke={path.stroke}
              strokeOpacity={path.opacity}
              strokeWidth={path.strokeWidth}
              strokeDasharray={path.dasharray}
              strokeDashoffset={path.dashoffset}
              strokeLinecap={path.linecap}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              transform={`translate(${path.jitterX} ${path.jitterY})`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
