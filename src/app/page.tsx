import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

const projects = [
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
  },
  {
    title: "Egg",
    href: undefined,
    desc: "My humble assistant, built and tuned in OpenClaw: workflows, guardrails, browser relay automation, and practical daily leverage.",
    meta: "Agent",
    topLeftTag: "OpenClaw",
    topRightTag: "Evolving daily",
    status: "progress",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] [font-style:normal]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,rgba(0,0,0,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.055)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(700px_circle_at_30%_20%,black,transparent_70%)] bg-[radial-gradient(700px_circle_at_20%_10%,rgba(45,45,45,0.045),transparent_60%)]" />
      </div>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:px-6 sm:pt-20">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-black/60 [font-style:normal]">
            addel.xyz
          </p>
          <h1 className="ink mt-4 font-[family-name:var(--font-display)] text-6xl leading-[0.9] [font-style:normal] sm:text-8xl">
            Hi, I&apos;m Addel.
          </h1>
          <p className="mt-4 text-[18px] leading-8 text-black/70 [font-style:normal]">
            coder, AI tinkerer, tech enthusiast. I like building clean systems, sweating
            the details, and making the computer do the boring bits.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="mailto:ahamoudhy@gmail.com" variant="primary">
              Email me
            </Button>
            <Button href="https://linkedin.com/addelh28" variant="secondary" external>
              LinkedIn
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "working out / staying healthy",
              "being a loving husband",
              "gaming",
              "traveling",
              "pizza",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border-2 border-[color:var(--box)] bg-white px-3 py-1 text-xs font-semibold text-black/70 [font-style:normal]"
              >
                {item}
              </span>
            ))}
          </div>
        </header>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-6">
            <h2 className="ink font-[family-name:var(--font-display)] text-3xl leading-none [font-style:normal]">
              Things I&apos;ve built
            </h2>
            <p className="hidden text-[15px] font-semibold text-black/50 [font-style:normal] sm:block">
              Small, useful, shipped.
            </p>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {projects.map((p) => (
              <Card
                key={p.title}
                title={p.title}
                href={p.href}
                meta={p.meta}
                topLeftTag={(p as any).topLeftTag}
                topRightTag={(p as any).topRightTag}
                status={(p as any).status}
                imageSrc={(p as any).imageSrc}
                imageAlt={(p as any).imageAlt}
              >
                {p.desc}
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t-2 border-dashed border-black/20 pt-8 text-[15px] text-black/60 [font-style:normal]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Addel Hamoudhy</p>
            <a
              className="underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
              href="mailto:ahamoudhy@gmail.com"
            >
              ahamoudhy@gmail.com
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
