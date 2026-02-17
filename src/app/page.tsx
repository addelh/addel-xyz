import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

type Project = {
  title: string;
  href?: string;
  desc: string;
  meta: string;
  topLeftTag: string;
  topRightTag: string;
  status: "live" | "progress";
  imageSrc?: string;
  imageAlt?: string;
  detailsMode?: "hidden" | "modal";
  detailsHeading?: string;
  detailsItems?: readonly string[];
};

const projects: Project[] = [
  {
    title: "ZeekChat",
    href: "https://zeekchat.ai",
    desc: "AI creation made human — a product I built to help people spin up personal AI experts fast.",
    meta: "Product",
    topLeftTag: "AI",
    topRightTag: "Live",
    status: "live",
    imageSrc: "/shots/zeekchat.png",
    imageAlt: "ZeekChat landing page",
  },
  {
    title: "Seedhealth",
    href: "https://seedhealthnaturopathy.com",
    desc: "A calm, conversion-first funnel for a naturopathy practice — simple, fast, and human.",
    meta: "Web",
    topLeftTag: "Site",
    topRightTag: "Live",
    status: "live",
    imageSrc: "/shots/seedhealth.jpg",
    imageAlt: "Seedhealth landing page",
  },
  {
    title: "This site",
    href: undefined,
    desc: "Built with Next.js + TypeScript + Tailwind. Minimal, but stylised — designed for clarity and speed.",
    meta: "Next.js",
    topLeftTag: "Portfolio",
    topRightTag: "Live",
    status: "live",
    detailsMode: "hidden",
  },
  {
    title: "Egg",
    href: undefined,
    desc: "My humble assistant, built and tuned in OpenClaw: workflows, guardrails, browser relay automation, and practical daily leverage.",
    meta: "Agent",
    topLeftTag: "OpenClaw",
    topRightTag: "Evolving daily",
    status: "progress",
    detailsMode: "modal",
    detailsHeading: "What Egg has done for Del",
    detailsItems: [
      "Set up practical workflows that speed up coding and debugging tasks.",
      "Added guardrails so day-to-day output stays consistent and reliable.",
      "Automates repetitive browser relay steps that used to eat up focus.",
      "Handles boring execution loops so Del can focus on higher-leverage decisions.",
    ],
  },
];

const thingsAboutMe = [
  { label: "working out", emoji: "💪" },
  { label: "being a loving husband", emoji: "🥰" },
  { label: "gaming", emoji: "🎮" },
  { label: "traveling", emoji: "✈️" },
  { label: "pizza", emoji: "🍕" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] [font-style:normal]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,rgba(0,0,0,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.055)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(700px_circle_at_30%_20%,black,transparent_70%)] bg-[radial-gradient(700px_circle_at_20%_10%,rgba(45,45,45,0.045),transparent_60%)]" />
      </div>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:px-6 sm:pt-20">
        <header className="w-full">
          <h1 className="ink font-[family-name:var(--font-display)] text-6xl leading-[0.9] [font-style:normal] sm:text-8xl">
            Hi, I&apos;m Addel.
          </h1>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[18px] leading-8 text-black/70 [font-style:normal]">
                vibe coder, AI tinkerer, tech enthusiast. I like building clean systems, sweating
                the details, and making the computer do the boring bits.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {thingsAboutMe.map((item, index) => {
                  const palette = [
                    { bg: "#d7f7ff", pop: "#00d4ff" },
                    { bg: "#fff0d6", pop: "#ff8a00" },
                    { bg: "#e6dcff", pop: "#8b5cf6" },
                    { bg: "#dcffe6", pop: "#22c55e" },
                    { bg: "#ffe0ef", pop: "#fb7185" },
                    { bg: "#fff7a8", pop: "#f59e0b" },
                  ];

                  const colors = palette[index % palette.length];

                  return (
                    <span
                      key={item.label}
                      className="interest-pill group cursor-default [font-style:normal]"
                      style={
                        {
                          "--pill-bg": colors.bg,
                          "--pill-pop": colors.pop,
                        } as React.CSSProperties
                      }
                    >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 top-1/2 z-10 -translate-y-1/2 text-2xl text-black opacity-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-7 group-hover:translate-x-2 group-hover:rotate-12 group-hover:opacity-100"
                    >
                      {item.emoji}
                    </span>
                  </span>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0 lg:justify-end">
              <Button
                href="mailto:ahamoudhy@gmail.com"
                variant="secondary"
                ariaLabel="Email me"
                className="h-12 w-12 rounded-full !p-0 !gap-0 shadow-[4px_4px_0_#111] transition hover:scale-110 hover:shadow-[6px_6px_0_#111] hover:bg-white hover:border-[#EA4335] hover:text-[#EA4335]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="block shrink-0"
                  style={{ width: 32, height: 32 }}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 8.25c0-.69.56-1.25 1.25-1.25h11.5c.69 0 1.25.56 1.25 1.25V16.75c0 .69-.56 1.25-1.25 1.25H6.25C5.56 18 5 17.44 5 16.75V8.25Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.2 8.2L12 12.2L17.8 8.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <Button
                href="https://linkedin.com/addelh28"
                variant="secondary"
                external
                ariaLabel="LinkedIn"
                className="h-12 w-12 rounded-full !p-0 !gap-0 shadow-[4px_4px_0_#111] transition hover:scale-110 hover:shadow-[6px_6px_0_#111] hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="block shrink-0"
                  style={{ width: 32, height: 32 }}
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6.94 7.5a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88ZM5.5 20h2.9V9.1H5.5V20Zm5.1-10.9V20h2.9v-5.6c0-1.48.28-2.92 2.11-2.92 1.8 0 1.82 1.68 1.82 3.02V20h2.9v-6.1c0-2.99-.65-5.29-4.15-5.29-1.68 0-2.8.92-3.26 1.79h-.04V9.1h-2.78Z" />
                </svg>
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-6">
            <h2 className="ink font-[family-name:var(--font-display)] text-3xl leading-none [font-style:normal]">
              Things I&apos;ve built
            </h2>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {projects.map((p) => (
              <Card
                key={p.title}
                title={p.title}
                href={p.href}
                meta={p.meta}
                topLeftTag={p.topLeftTag}
                topRightTag={p.topRightTag}
                status={p.status}
                imageSrc={p.imageSrc}
                imageAlt={p.imageAlt}
                detailsMode={p.detailsMode}
                detailsHeading={p.detailsHeading}
                detailsItems={p.detailsItems}
              >
                {p.desc}
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t-2 border-dashed border-black/20 pt-8 text-[15px] text-black/60 [font-style:normal]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Addel Hamoudhy</p>
            <p>Built by Egg 🥚</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
