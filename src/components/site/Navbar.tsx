import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Moon, Sun, X, Globe, Check } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";
import { IMAGES } from "@/lib/site";
import { Magnetic } from "./motion-helpers";

const links = [
  { id: "home", key: "nav.home" },
  { id: "about", key: "nav.about" },
  { id: "services", key: "nav.services" },
  { id: "work", key: "nav.work" },
  { id: "contact", key: "nav.contact" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pickLang = (l: Lang) => {
    setLang(l);
    setLangOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 sm:px-4 ${
          scrolled ? "glass shadow-elegant" : "bg-transparent"
        }`}
      >
        <button
          onClick={() => scrollTo("home")}
          className="flex shrink-0 items-center gap-2.5 pl-1"
          aria-label="Daniel Korsa home"
        >
          <img src={IMAGES.logo} alt="Danny Graphics logo" className="h-9 w-9 object-contain" />
          <span className="font-display text-base font-bold tracking-tight">
            Danny<span className="text-gradient-gold">.</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t(l.key)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Change language"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {LANGUAGES.find((x) => x.code === lang)?.short}
              </span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="glass absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl p-1.5 shadow-elegant"
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => pickLang(l.code)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      >
                        {l.label}
                        {lang === l.code && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </button>

          <Magnetic className="hidden sm:block">
            <button
              onClick={() => scrollTo("contact")}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow"
            >
              {t("nav.book")}
            </button>
          </Magnetic>

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="glass mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl p-3 shadow-elegant md:hidden"
          >
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  scrollTo(l.id);
                  setOpen(false);
                }}
                className="block w-full rounded-2xl px-4 py-3 text-left text-base font-medium transition-colors hover:bg-secondary"
              >
                {t(l.key)}
              </button>
            ))}
            <button
              onClick={() => {
                scrollTo("contact");
                setOpen(false);
              }}
              className="mt-1 block w-full rounded-2xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground"
            >
              {t("nav.book")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
