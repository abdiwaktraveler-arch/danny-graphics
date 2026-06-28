import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X, Phone, Mail, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CONTACT } from "@/lib/site";

export default function FloatingWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const items = [
    { icon: Phone, label: t("widget.call"), href: CONTACT.phoneHref, color: "var(--gradient-brand)" },
    { icon: Send, label: "Telegram", href: CONTACT.bizTelegramHref, color: "var(--gradient-brand)" },
    { icon: Mail, label: t("contact.email"), href: CONTACT.emailHref, color: "var(--gradient-gold)" },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="glass flex flex-col gap-2 rounded-3xl p-3 shadow-elegant"
          >
            <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground">{t("widget.title")}</p>
            {items.map((it, i) => (
              <motion.a
                key={it.label}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-secondary"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
                  style={{ background: it.color }}
                >
                  <it.icon className="h-4 w-4" />
                </span>
                <span className="pr-2 text-sm font-medium">{it.label}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-glow ${
          open ? "" : "animate-pulse-ring"
        }`}
        style={{ background: "var(--gradient-brand)" }}
        aria-label={t("widget.title")}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "msg"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
