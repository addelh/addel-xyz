"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type Size = {
  width: number;
  height: number;
};

type BorderLayer = {
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  filterId: string;
};

type FilterRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundedRectPath(x: number, y: number, width: number, height: number, radius: number): string {
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

function getFilterRegion(size: Size, padding: number): FilterRegion {
  return {
    x: -padding,
    y: -padding,
    width: size.width + padding * 2,
    height: size.height + padding * 2,
  };
}

export function CardBorderOverlay() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const filterIdBase = useId().replace(/:/g, "");
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

  const { mainLayer, offsetLayer, filterRegion } = useMemo(() => {
    const MIN_SIZE = 48;
    if (size.width < MIN_SIZE || size.height < MIN_SIZE) {
      return {
        mainLayer: null as BorderLayer | null,
        offsetLayer: null as BorderLayer | null,
        filterRegion: getFilterRegion(size, 24),
      };
    }

    const mainInset = 11.2;
    const mainWidth = Math.max(16, size.width - mainInset * 2);
    const mainHeight = Math.max(16, size.height - mainInset * 2);
    const mainRadius = clamp(Math.min(mainWidth, mainHeight) * 0.14, 19, 30);

    const offsetShiftX = 5.2;
    const offsetShiftY = 5.6;
    const offsetWidth = Math.max(14, mainWidth - 0.8);
    const offsetHeight = Math.max(14, mainHeight - 0.8);
    const mainFilterId = `${filterIdBase}-main-border-wobble`;
    const offsetFilterId = `${filterIdBase}-offset-border-wobble`;

    return {
      mainLayer: {
        d: roundedRectPath(
          mainInset,
          mainInset,
          mainWidth,
          mainHeight,
          mainRadius
        ),
        stroke: "#1f1f1f",
        strokeWidth: 2.2,
        opacity: 0.92,
        filterId: mainFilterId,
      },
      offsetLayer: {
        d: roundedRectPath(
          mainInset + offsetShiftX,
          mainInset + offsetShiftY,
          offsetWidth,
          offsetHeight,
          mainRadius + 1.1
        ),
        stroke: "#252525",
        strokeWidth: 1.85,
        opacity: 0.38,
        filterId: offsetFilterId,
      },
      filterRegion: getFilterRegion(size, 24),
    };
  }, [filterIdBase, size.height, size.width]);

  const mainFilterId = mainLayer?.filterId;
  const offsetFilterId = offsetLayer?.filterId;

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
        <defs>
          {offsetFilterId ? (
            <filter
              id={offsetFilterId}
              x={filterRegion.x}
              y={filterRegion.y}
              width={filterRegion.width}
              height={filterRegion.height}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.019 0.026"
                numOctaves={1}
                seed={3307}
                result="offsetInkNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="offsetInkNoise"
                scale={0.9}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ) : null}
          {mainFilterId ? (
            <filter
              id={mainFilterId}
              x={filterRegion.x}
              y={filterRegion.y}
              width={filterRegion.width}
              height={filterRegion.height}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.015 0.021"
                numOctaves={1}
                seed={1103}
                result="mainInkNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="mainInkNoise"
                scale={0.58}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ) : null}
        </defs>
        {offsetLayer ? (
          <path
            d={offsetLayer.d}
            fill="none"
            stroke={offsetLayer.stroke}
            strokeOpacity={offsetLayer.opacity}
            strokeWidth={offsetLayer.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            filter={`url(#${offsetLayer.filterId})`}
          />
        ) : null}
        {mainLayer ? (
          <path
            d={mainLayer.d}
            fill="none"
            stroke={mainLayer.stroke}
            strokeOpacity={mainLayer.opacity}
            strokeWidth={mainLayer.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            filter={`url(#${mainLayer.filterId})`}
          />
        ) : null}
      </svg>
    </div>
  );
}
