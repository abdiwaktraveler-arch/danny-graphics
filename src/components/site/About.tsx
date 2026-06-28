import { motion } from "motion/react";
import { Palette, PenTool, Layers, Share2, Printer, Wand2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Counter, Reveal } from "./motion-helpers";

const stats = [
  { key: "about.stat1", to: 200, suffix: "+" },
  { key: "about.stat2", to: 120, suffix: "+" },
  { key: "about.stat3", to: 5, suffix: "+" },
  { key: "about.stat4", to: 60, suffix: "+" },
];

const skills = [
  { key: "skill.branding", icon: Palette, level: 95 },
  { key: "skill.logo", icon: PenTool, level: 92 },
  { key: "skill.poster", icon: Layers, level: 90 },
  { key: "skill.social", icon: Share2, level: 94 },
  { key: "skill.print", icon: Printer, level: 88 },
  { key: "skill.photoshop", icon: Wand2, level: 96 },
];

const timeline = ["tl.1", "tl.2", "tl.3"];

export default function About() {
  const { t } = useI18n();

  return (
    <section id="about" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mb-14 max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            {t("about.kicker")}
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("about.title")}
          </h2>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr]">
          {/* Story + philosophy */}
          <div>
            <Reveal delay={0.05}>
              <p className="text-lg leading-relaxed text-muted-foreground">{t("about.p1")}</p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("about.p2")}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="glass mt-8 rounded-3xl p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-gradient">
                  {t("about.philosophyTitle")}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{t("about.philosophy")}</p>
              </div>
            </Reveal>

            {/* stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s, i) => (
                <Reveal key={s.key} delay={0.1 + i * 0.08}>
                  <div className="glass rounded-2xl p-4 text-center shadow-soft">
                    <p className="font-display text-3xl font-bold text-gradient">
                      <Counter to={s.to} suffix={s.suffix} />
                    </p>
                    <p className="mt-1 text-xs leading-tight text-muted-foreground">{t(s.key)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <Reveal>
              <h3 className="mb-5 font-display text-lg font-semibold">{t("about.skills")}</h3>
            </Reveal>
            <div className="space-y-4">
              {skills.map((s, i) => (
                <Reveal key={s.key} delay={i * 0.07}>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <s.icon className="h-4 w-4 text-primary" />
                        {t(s.key)}
                      </span>
                      <span className="text-muted-foreground">{s.level}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.level}%` }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 1, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: "var(--gradient-brand)" }}
                      />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Reveal className="mt-20">
          <h3 className="mb-10 text-center font-display text-2xl font-bold sm:text-3xl">
            {t("about.timelineTitle")}
          </h3>
        </Reveal>
        <div className="relative grid gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 top-6 hidden h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
          {timeline.map((tl, i) => (
            <Reveal key={tl} delay={i * 0.12}>
              <div className="relative text-center md:text-left">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full glass shadow-glow md:mx-0">
                  <span className="font-display text-lg font-bold text-gradient">{i + 1}</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                  {t(`${tl}.year`)}
                </span>
                <h4 className="mt-1 font-display text-lg font-semibold">{t(`${tl}.title`)}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`${tl}.desc`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
