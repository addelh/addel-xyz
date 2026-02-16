import Image from "next/image";
import { type ReactNode } from "react";
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
}) {
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
            <div className="flex items-center justify-end">
              {href ? (
                <span className="rounded-xl border-2 border-[color:var(--box)] bg-white px-4 py-2 text-[15px] font-semibold [font-style:normal]">
                  Open ↗
                </span>
              ) : (
                <span className="rounded-xl border-2 border-[color:var(--box)] bg-white px-4 py-2 text-[15px] font-semibold [font-style:normal]">
                  Details
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!href) return card;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {card}
    </a>
  );
}
