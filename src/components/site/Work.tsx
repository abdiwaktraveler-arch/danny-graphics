import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";
import { Eye, X, ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PROJECTS, type WorkCategory } from "@/lib/site";
import { getPublicWorks } from "@/lib/works.functions";
import { Reveal } from "./motion-helpers";

const filters: { id: "all" | WorkCategory; key: string }[] = [
  { id: "all", key: "work.filter.all" },
  { id: "branding", key: "work.filter.branding" },
  { id: "poster", key: "work.filter.poster" },
  { id: "logo", key: "work.filter.logo" },
  { id: "social", key: "work.filter.social" },
];

type WorkItem = {
  id: string;
  image: string;
  title: string;
  category: WorkCategory;
  span?: boolean;
};

export default function Work() {
  const { t } = useI18n();
  const callGetWorks = useServerFn(getPublicWorks);
  const [active, setActive] = useState<"all" | WorkCategory>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [dbItems, setDbItems] = useState<WorkItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    callGetWorks()
      .then((rows) => {
        if (!alive) return;
        setDbItems(
          rows.map((r) => ({
            id: r.id,
            image: r.url,
            title: r.title,
            category: r.category,
            span: r.featured,
          })),
        );
      })
      .catch(() => alive && setDbItems([]));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use admin-managed works when available; otherwise show the built-in samples.
  const items: WorkItem[] = useMemo(() => {
    if (dbItems && dbItems.length > 0) return dbItems;
    return PROJECTS.map((p) => ({
      id: p.id,
      image: p.image,
      title: t(p.titleKey),
      category: p.category,
      span: p.span,
    }));
  }, [dbItems, t]);

  const visible = items.filter((p) => active === "all" || p.category === active);

  const openAt = (id: string) => {
    const idx = visible.findIndex((p) => p.id === id);
    setLightbox(idx);
  };
  const step = (dir: number) => {
    setLightbox((cur) => {
      if (cur === null) return cur;
      return (cur + dir + visible.length) % visible.length;
    });
  };

  return (
    <section id="work" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            {t("work.kicker")}
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("work.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("work.subtitle")}</p>
        </Reveal>

        {/* filters */}
        <Reveal className="mb-10 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                active === f.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active === f.id && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--gradient-brand)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{t(f.key)}</span>
            </button>
          ))}
        </Reveal>

        {/* masonry-ish grid */}
        <motion.div layout className="grid auto-rows-[200px] grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.button
                layout
                key={p.id}
                onClick={() => openAt(p.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative overflow-hidden rounded-3xl shadow-soft ${
                  p.span ? "col-span-2 row-span-2" : "row-span-2 sm:row-span-1"
                }`}
              >
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-accent/90 via-accent/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 text-left opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gold">
                    {t(`work.filter.${p.category}`)}
                  </span>
                  <h3 className="font-display text-base font-semibold text-white">{p.title}</h3>
                </div>
                <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full glass opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <Eye className="h-4 w-4 text-white" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && visible[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-accent/80 p-4 backdrop-blur-md"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full glass text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full glass text-white sm:left-6"
              aria-label="Previous"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full glass text-white sm:right-6"
              aria-label="Next"
            >
              <ArrowRight className="h-5 w-5" />
            </button>

            <motion.div
              key={visible[lightbox].id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl glass p-2 shadow-elegant"
            >
              <img
                src={visible[lightbox].image}
                alt={visible[lightbox].title}
                className="max-h-[72vh] w-full rounded-2xl object-contain"
              />
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gold">
                    {t(`work.filter.${visible[lightbox].category}`)}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {visible[lightbox].title}
                  </h3>
                </div>
                <span className="text-sm text-white/60">
                  {lightbox + 1} / {visible.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
