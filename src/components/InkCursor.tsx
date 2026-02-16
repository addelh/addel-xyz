"use client";

import { useEffect, useRef } from "react";

type InkParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  growth: number;
  stretchX: number;
  stretchY: number;
  rotation: number;
};

type Point = {
  x: number;
  y: number;
};

const MAX_PARTICLES = 260;
const TRAIL_SPACING_PX = 6;
const INK_COLOR = "rgba(18, 18, 18, 1)";

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const addMediaChangeListener = (
  mediaQuery: MediaQueryList,
  listener: () => void,
) => {
  mediaQuery.addEventListener("change", listener);
  return () => mediaQuery.removeEventListener("change", listener);
};

const isFinePointerEvent = (event: PointerEvent) =>
  event.pointerType === "mouse" || event.pointerType === "pen" || event.pointerType === "";

export function InkCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const hoverQuery = window.matchMedia("(hover: hover)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const particles: InkParticle[] = [];

    let context: CanvasRenderingContext2D | null = null;
    let rafId = 0;
    let lastFrameTime = 0;
    let lastPointer: Point | null = null;
    let isRunning = false;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    const setEnabledStyles = (enabled: boolean) => {
      document.body.classList.toggle("ink-cursor-enabled", enabled);
      canvas.style.opacity = enabled ? "1" : "0";
    };

    const trimParticleCount = () => {
      if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
      }
    };

    const addParticle = (particle: InkParticle) => {
      particles.push(particle);
      trimParticleCount();
    };

    const spawnTrailBlob = (x: number, y: number) => {
      addParticle({
        x: x + randomBetween(-0.8, 0.8),
        y: y + randomBetween(-0.8, 0.8),
        vx: randomBetween(-0.03, 0.03),
        vy: randomBetween(-0.03, 0.03),
        radius: randomBetween(1.2, 2.4),
        alpha: randomBetween(0.045, 0.095),
        decay: randomBetween(0.008, 0.014),
        growth: randomBetween(0.005, 0.02),
        stretchX: randomBetween(0.8, 1.2),
        stretchY: randomBetween(0.75, 1.3),
        rotation: randomBetween(0, Math.PI),
      });
    };

    const spawnClickSplatter = (x: number, y: number) => {
      addParticle({
        x,
        y,
        vx: randomBetween(-0.03, 0.03),
        vy: randomBetween(-0.03, 0.03),
        radius: randomBetween(2.4, 3.6),
        alpha: randomBetween(0.19, 0.27),
        decay: randomBetween(0.002, 0.003),
        growth: randomBetween(0.015, 0.04),
        stretchX: randomBetween(0.8, 1.2),
        stretchY: randomBetween(0.8, 1.3),
        rotation: randomBetween(0, Math.PI),
      });

      const splatterCount = Math.floor(randomBetween(8, 13));
      for (let index = 0; index < splatterCount; index += 1) {
        const angle = randomBetween(0, Math.PI * 2);
        const distance = randomBetween(3, 16);
        const drift = randomBetween(0.015, 0.08);

        addParticle({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          vx: Math.cos(angle) * drift,
          vy: Math.sin(angle) * drift,
          radius: randomBetween(1.3, 3.5),
          alpha: randomBetween(0.11, 0.2),
          decay: randomBetween(0.0015, 0.0025),
          growth: randomBetween(0.01, 0.03),
          stretchX: randomBetween(0.65, 1.35),
          stretchY: randomBetween(0.65, 1.45),
          rotation: randomBetween(0, Math.PI),
        });
      }
    };

    const resizeCanvas = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(viewportWidth * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(viewportHeight * devicePixelRatio));
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;

      context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.fillStyle = INK_COLOR;
      context.clearRect(0, 0, viewportWidth, viewportHeight);
    };

    const render = (time: number) => {
      if (!isRunning) {
        return;
      }

      if (!context) {
        rafId = window.requestAnimationFrame(render);
        return;
      }

      const frameDelta = Math.min((time - lastFrameTime) / 16.67, 2);
      lastFrameTime = time;

      context.clearRect(0, 0, viewportWidth, viewportHeight);
      context.fillStyle = INK_COLOR;

      let liveCount = 0;
      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        particle.x += particle.vx * frameDelta;
        particle.y += particle.vy * frameDelta;
        particle.radius += particle.growth * frameDelta;
        particle.alpha -= particle.decay * frameDelta;

        if (particle.alpha <= 0) {
          continue;
        }

        particles[liveCount] = particle;
        liveCount += 1;

        context.globalAlpha = particle.alpha;
        context.beginPath();
        context.ellipse(
          particle.x,
          particle.y,
          particle.radius * particle.stretchX,
          particle.radius * particle.stretchY,
          particle.rotation,
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      particles.length = liveCount;
      context.globalAlpha = 1;

      rafId = window.requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isFinePointerEvent(event)) {
        return;
      }

      const pointer = { x: event.clientX, y: event.clientY };
      if (!lastPointer) {
        lastPointer = pointer;
        spawnTrailBlob(pointer.x, pointer.y);
        return;
      }

      const deltaX = pointer.x - lastPointer.x;
      const deltaY = pointer.y - lastPointer.y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < 0.75) {
        return;
      }

      const stepCount = Math.max(1, Math.min(8, Math.floor(distance / TRAIL_SPACING_PX)));
      for (let step = 1; step <= stepCount; step += 1) {
        const progress = step / stepCount;
        spawnTrailBlob(lastPointer.x + deltaX * progress, lastPointer.y + deltaY * progress);
      }

      lastPointer = pointer;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!isFinePointerEvent(event)) {
        return;
      }

      spawnClickSplatter(event.clientX, event.clientY);
    };

    const stop = () => {
      if (isRunning) {
        isRunning = false;
        window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resizeCanvas);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerdown", onPointerDown);
      }

      particles.length = 0;
      lastPointer = null;

      if (context) {
        context.clearRect(0, 0, viewportWidth, viewportHeight);
      }

      setEnabledStyles(false);
    };

    const start = () => {
      if (isRunning) {
        return;
      }

      isRunning = true;
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      setEnabledStyles(true);

      lastFrameTime = performance.now();
      rafId = window.requestAnimationFrame(render);
    };

    const syncEnabledState = () => {
      const shouldEnable =
        finePointerQuery.matches && hoverQuery.matches && !reducedMotionQuery.matches;

      if (shouldEnable) {
        start();
      } else {
        stop();
      }
    };

    const removeQueryListeners = [
      addMediaChangeListener(finePointerQuery, syncEnabledState),
      addMediaChangeListener(hoverQuery, syncEnabledState),
      addMediaChangeListener(reducedMotionQuery, syncEnabledState),
    ];

    syncEnabledState();

    return () => {
      removeQueryListeners.forEach((removeListener) => removeListener());
      stop();
      document.body.classList.remove("ink-cursor-enabled");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] opacity-0 transition-opacity duration-200"
    />
  );
}
