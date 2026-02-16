"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { OpSet } from "roughjs/bin/core";
import rough from "roughjs/bin/rough";

type Size = {
  width: number;
  height: number;
};

type StrokePath = {
  key: string;
  d: string;
  strokeWidth: number;
  opacity: number;
};

type StrokePass = {
  seed: number;
  strokeWidth: number;
  roughness: number;
  bowing: number;
  maxRandomnessOffset: number;
  opacity: number;
};

const generator = rough.generator();

const MAIN_STROKES: StrokePass[] = [
  {
    seed: 10241,
    strokeWidth: 2.05,
    roughness: 1.6,
    bowing: 1.95,
    maxRandomnessOffset: 2.4,
    opacity: 0.9,
  },
  {
    seed: 10242,
    strokeWidth: 1.45,
    roughness: 2.1,
    bowing: 2.55,
    maxRandomnessOffset: 2.9,
    opacity: 0.62,
  },
  {
    seed: 10243,
    strokeWidth: 1.0,
    roughness: 1.85,
    bowing: 1.8,
    maxRandomnessOffset: 2.2,
    opacity: 0.46,
  },
];

const OFFSET_STROKES: StrokePass[] = [
  {
    seed: 20481,
    strokeWidth: 1.75,
    roughness: 1.75,
    bowing: 2.25,
    maxRandomnessOffset: 2.8,
    opacity: 0.56,
  },
  {
    seed: 20482,
    strokeWidth: 1.15,
    roughness: 2.2,
    bowing: 2.7,
    maxRandomnessOffset: 3.0,
    opacity: 0.39,
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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
  const noise = Math.sin((seed + pathIndex * 13.37) * 12.9898) * 43758.5453;
  const normalized = noise - Math.floor(noise);
  const drift = (normalized - 0.5) * 0.16;
  return clamp(baseOpacity + drift, 0.18, 1);
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
        strokeWidth: pass.strokeWidth,
        opacity: opacityVariance(pass.opacity, pass.seed, setIndex),
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
      >
        <g>
          {offsetPaths.map((path) => (
            <path
              key={path.key}
              d={path.d}
              fill="none"
              stroke="#2d2d2d"
              strokeOpacity={path.opacity}
              strokeWidth={path.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        <g>
          {mainPaths.map((path) => (
            <path
              key={path.key}
              d={path.d}
              fill="none"
              stroke="#2d2d2d"
              strokeOpacity={path.opacity}
              strokeWidth={path.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
