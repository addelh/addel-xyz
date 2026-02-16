"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useId, useState } from "react";
import { CardBorderOverlay } from "@/components/CardBorderOverlay";

export function Card({
  title,
  href,
  children,
  meta,
  imageSrc,
  imageAlt,
  topLeftTag,
  topRightTag,
  status,
  detailsMode,
  detailsHeading,
  detailsItems,
}: {
  title: string;
  href?: string;
  children: ReactNode;
  meta?: string;
  imageSrc?: string;
  imageAlt?: string;
  topLeftTag?: string;
  topRightTag?: string;
  status?: "live" | "progress";
  detailsMode?: "hidden" | "static" | "modal";
  detailsHeading?: string;
  detailsItems?: readonly string[];
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const modalTitleId = useId();

  const resolvedDetailsMode = detailsMode ?? (href ? "hidden" : "static");
  const canOpenDetailsModal = resolvedDetailsMode === "modal" && Boolean(detailsItems?.length);

  useEffect(() => {
    if (!isDetailsOpen) return;

    const originalOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDetailsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDetailsOpen]);

  const card = (
    <div className="vox-card-shell group relative p-[12px] transition hover:translate-y-[-3px] hover:rotate-[-0.35deg]">
      <CardBorderOverlay />

      <div className="vox-card relative z-10">
        <div className="relative z-10 flex items-center justify-between gap-3 px-6 pt-6">
          {topLeftTag ? (
            <span className="rounded-lg border-2 border-[color:var(--box)] bg-white px-2.5 py-1 text-xs font-semibold [font-style:normal]">
              {topLeftTag}
            </span>
          ) : (
            <span />
          )}

          {topRightTag ? (
            <span
              className={`inline-flex items-center gap-1 rounded-lg border-2 border-[color:var(--box)] px-2.5 py-1 text-xs font-semibold [font-style:normal] ${
                status === "live"
                  ? "bg-emerald-100"
                  : status === "progress"
                    ? "bg-yellow-100"
                    : "bg-white"
              }`}
            >
              {status === "live" ? (
                <span
                  aria-hidden="true"
                  className="translate-y-[-0.5px] text-[11px] leading-none text-emerald-700"
                >
                  ✓
                </span>
              ) : status === "progress" ? (
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              ) : null}
              {topRightTag}
            </span>
          ) : null}
        </div>

        {imageSrc ? (
          <div className="relative z-10 mt-4 px-6">
            <div className="overflow-hidden rounded-2xl border-2 border-[color:var(--box)] bg-[#f3f3ef]">
              <Image
                src={imageSrc}
                alt={imageAlt ?? title}
                width={1200}
                height={630}
                loading="eager"
                className="h-44 w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="relative z-10 px-6 pb-7 pt-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="ink font-[family-name:var(--font-display)] text-[36px] leading-[1.0] [font-style:normal]">
              {title}
            </h3>
            {meta ? (
              <span className="rounded-lg border-2 border-[color:var(--box)] bg-white px-2.5 py-1 text-xs font-semibold [font-style:normal]">
                {meta}
              </span>
            ) : null}
          </div>

          <div className="mt-3 text-[16px] leading-7 text-black/70 [font-style:normal]">
            {children}
          </div>

          <div className="mt-6 border-t-2 border-dashed border-black/20 pt-5">
            <div className="flex min-h-[40px] items-center justify-end">
              {href ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[color:var(--box)] bg-white px-4 py-2 text-[15px] font-semibold [font-style:normal]">
                  Open
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.5 3.5H16.5V8.5M8.5 11.5L16.5 3.5M16.5 11V16.5H3.5V3.5H9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : canOpenDetailsModal ? (
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(true)}
                  className="rounded-full border-[3px] border-[color:var(--box)] bg-orange-50/70 px-4 py-2 text-[15px] font-semibold text-black/85 transition-colors duration-200 hover:bg-orange-300/80 group-hover:bg-orange-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)] [font-style:normal]"
                >
                  Details
                </button>
              ) : resolvedDetailsMode === "static" ? (
                <span className="rounded-full border-[3px] border-[color:var(--box)] bg-orange-50/70 px-4 py-2 text-[15px] font-semibold text-black/85 transition-colors duration-200 hover:bg-orange-300/80 group-hover:bg-orange-300/80 [font-style:normal]">
                  Details
                </span>
              ) : (
                <span aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const detailsModal =
    canOpenDetailsModal && isDetailsOpen ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
        onClick={() => setIsDetailsOpen(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          className="w-full max-w-lg rounded-2xl border-2 border-[color:var(--box)] bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <h4
              id={modalTitleId}
              className="ink font-[family-name:var(--font-display)] text-3xl leading-[1.05] [font-style:normal]"
            >
              {detailsHeading ?? `${title} details`}
            </h4>
            <button
              type="button"
              onClick={() => setIsDetailsOpen(false)}
              className="rounded-lg border-2 border-[color:var(--box)] bg-white px-2 py-1 text-sm font-semibold text-black/80 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)] [font-style:normal]"
              aria-label="Close details popup"
            >
              X
            </button>
          </div>

          <ul className="mt-4 space-y-2 text-[15px] leading-6 text-black/75 [font-style:normal]">
            {detailsItems?.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--box)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : null;

  if (!href) {
    return (
      <>
        {card}
        {detailsModal}
      </>
    );
  }

  return (
    <>
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {card}
      </a>
      {detailsModal}
    </>
  );
}
