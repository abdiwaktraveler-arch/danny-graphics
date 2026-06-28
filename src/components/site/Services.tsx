import { ArrowUpRight, Palette, PenTool, Layers, Share2, CalendarHeart, Printer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Reveal, Tilt } from "./motion-helpers";

interface Svc {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const services: Svc[] = [
  { icon: Palette, titleKey: "service.branding.title", descKey: "service.branding.desc" },
  { icon: PenTool, titleKey: "service.logo.title", descKey: "service.logo.desc" },
  { icon: Layers, titleKey: "service.poster.title", descKey: "service.poster.desc" },
  { icon: Share2, titleKey: "service.social.title", descKey: "service.social.desc" },
  { icon: CalendarHeart, titleKey: "service.event.title", descKey: "service.event.desc" },
  { icon: Printer, titleKey: "service.print.title", descKey: "service.print.desc" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Services() {
  const { t } = useI18n();

  return (
    <section id="services" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            {t("services.kicker")}
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("services.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("services.subtitle")}</p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.titleKey} delay={(i % 3) * 0.08}>
              <Tilt className="group h-full">
                <div className="glass relative h-full overflow-hidden rounded-3xl p-7 shadow-soft transition-all duration-500 hover:shadow-glow">
                  {/* gradient sheen */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div
                    className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-soft transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <s.icon className="h-6 w-6" />
                  </div>

                  <h3 className="font-display text-xl font-semibold">{t(s.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(s.descKey)}</p>

                  <button
                    onClick={() => scrollTo("contact")}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-gold"
                  >
                    {t("service.cta")}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
