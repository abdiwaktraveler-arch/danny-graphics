import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { IMAGES } from "@/lib/site";
import { Magnetic } from "./motion-helpers";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useTypewriter(text: string, speed = 70) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

export default function Hero() {
  const { t } = useI18n();
  const typed = useTypewriter(t("hero.role"));
  const ref = useRef<HTMLDivElement>(null);

  // cursor-reactive parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mx.set(x);
      my.set(y);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const f1x = useTransform(sx, (v) => v * 30);
  const f1y = useTransform(sy, (v) => v * 30);
  const f2x = useTransform(sx, (v) => v * -40);
  const f2y = useTransform(sy, (v) => v * -24);
  const portraitX = useTransform(sx, (v) => v * 14);
  const portraitY = useTransform(sy, (v) => v * 14);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const words = t("hero.name").split(" ");

  return (
    <section id="home" ref={ref} className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16">
      {/* layered backgrounds */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* floating blobs */}
      <motion.div
        style={{ x: f1x, y: f1y }}
        className="pointer-events-none absolute -left-20 top-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-slow"
      />
      <motion.div
        style={{ x: f2x, y: f2y }}
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-gold/20 blur-3xl animate-float-rev"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        {/* Text */}
        <motion.div style={{ y: yParallax, opacity: fade }} className="text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {t("hero.badge")}
          </motion.span>

          <p className="mt-6 text-lg font-medium text-muted-foreground">{t("hero.greeting")}</p>

          <h1 className="mt-1 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            {words.map((w, i) => (
              <span key={i} className="mr-3 inline-block overflow-hidden align-bottom">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.35 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-block ${i === words.length - 1 ? "text-gradient" : ""}`}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>

          <p className="mt-4 font-display text-xl font-medium text-gold sm:text-2xl">
            {typed}
            <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-gold align-middle">&nbsp;</span>
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground lg:mx-0"
          >
            {t("hero.tagline")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Magnetic>
              <button
                onClick={() => scrollTo("contact")}
                className="group flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow"
              >
                {t("hero.cta.primary")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Magnetic>
            <Magnetic>
              <button
                onClick={() => scrollTo("work")}
                className="glass flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all hover:text-primary"
              >
                <Sparkles className="h-4 w-4 text-gold" />
                {t("hero.cta.secondary")}
              </button>
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* Portrait */}
        <motion.div
          style={{ x: portraitX, y: portraitY }}
          className="relative mx-auto w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* rotating glow ring */}
          <div className="absolute -inset-4 animate-spin-slow rounded-[2.5rem] opacity-70 blur-2xl" style={{ background: "var(--gradient-brand)" }} />
          <div className="absolute -inset-1 animate-gradient-pan rounded-[2.2rem] bg-gradient-to-tr from-primary via-gold to-accent opacity-90" />
          <div className="relative overflow-hidden rounded-[2rem] glass p-2 shadow-elegant">
            <img
              src={IMAGES.portrait}
              alt="Daniel Korsa, graphics and brand designer"
              className="aspect-[4/5] w-full rounded-[1.5rem] object-cover"
              loading="eager"
            />
          </div>

          {/* floating chips */}
          <motion.div
            style={{ x: f1x, y: f1y }}
            className="glass absolute -left-6 top-10 hidden rounded-2xl px-4 py-3 shadow-elegant sm:block"
          >
            <p className="font-display text-2xl font-bold text-gradient">5+</p>
            <p className="text-[11px] text-muted-foreground">Years</p>
          </motion.div>
          <motion.div
            style={{ x: f2x, y: f2y }}
            className="glass absolute -right-5 bottom-12 hidden rounded-2xl px-4 py-3 shadow-elegant sm:block"
          >
            <p className="font-display text-2xl font-bold text-gradient-gold">200+</p>
            <p className="text-[11px] text-muted-foreground">Projects</p>
          </motion.div>
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.button
        onClick={() => scrollTo("about")}
        style={{ opacity: fade }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
        aria-label={t("hero.scroll")}
      >
        <span className="text-[11px] uppercase tracking-[0.2em]">{t("hero.scroll")}</span>
        <span className="flex h-9 w-5 justify-center rounded-full border border-current pt-1.5">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="h-1.5 w-1.5 rounded-full bg-current"
          />
        </span>
        <ArrowDown className="h-3 w-3" />
      </motion.button>
    </section>
  );
}
