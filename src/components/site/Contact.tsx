import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Paperclip,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CONTACT } from "@/lib/site";
import { Reveal } from "./motion-helpers";
import { SocialRow } from "./socials";

const services = [
  "service.branding.title",
  "service.logo.title",
  "service.poster.title",
  "service.social.title",
  "service.event.title",
  "service.print.title",
];

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  textarea?: boolean;
}

function FloatingField({ id, label, type = "text", value, onChange, error, textarea }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <div className="relative">
        {textarea ? (
          <textarea
            id={id}
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`peer w-full resize-none rounded-2xl border bg-card/50 px-4 pb-2 pt-6 text-sm outline-none transition-colors ${
              error ? "border-destructive" : "border-border focus:border-primary"
            }`}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`peer w-full rounded-2xl border bg-card/50 px-4 pb-2 pt-6 text-sm outline-none transition-colors ${
              error ? "border-destructive" : "border-border focus:border-primary"
            }`}
          />
        )}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 transition-all duration-200 ${
            active ? "top-2 text-[11px] text-primary" : "top-4 text-sm text-muted-foreground"
          }`}
        >
          {label}
        </label>
      </div>
      {error && <p className="mt-1 pl-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function Contact() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = t("contact.err.name");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("contact.err.email");
    }
    if (s === 1 && !form.message.trim()) e.message = t("contact.err.message");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    if (!validateStep(0) || !validateStep(1)) {
      if (!validateStep(0)) setStep(0);
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1400);
  };

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) setFileName(files[0].name);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const reset = () => {
    setSent(false);
    setStep(0);
    setForm({ name: "", email: "", phone: "", service: "", message: "" });
    setFileName(null);
  };

  const contactItems = [
    { icon: Phone, label: t("contact.phone"), value: CONTACT.phone, href: CONTACT.phoneHref },
    { icon: Mail, label: t("contact.email"), value: CONTACT.email, href: CONTACT.emailHref },
    { icon: MapPin, label: t("contact.location"), value: t("contact.locationValue"), href: undefined },
    { icon: Send, label: t("contact.telegram"), value: CONTACT.telegram, href: CONTACT.telegramHref },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            {t("contact.kicker")}
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("contact.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("contact.subtitle")}</p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* contact info */}
          <Reveal>
            <div className="flex h-full flex-col gap-6">
              <h3 className="font-display text-lg font-semibold">{t("contact.reach")}</h3>
              <div className="space-y-3">
                {contactItems.map((c) => {
                  const inner = (
                    <div className="glass flex items-center gap-4 rounded-2xl p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary-foreground"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        <c.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                        <p className="truncate font-medium">{c.value}</p>
                      </div>
                    </div>
                  );
                  return c.href ? (
                    <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <div key={c.label}>{inner}</div>
                  );
                })}
              </div>
              <div className="mt-auto">
                <p className="mb-3 text-sm font-medium text-muted-foreground">{t("contact.follow")}</p>
                <SocialRow />
              </div>
            </div>
          </Reveal>

          {/* form */}
          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-6 shadow-elegant sm:p-8">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12 }}
                      className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary"
                    >
                      <CheckCircle2 className="h-10 w-10" />
                    </motion.div>
                    <h3 className="font-display text-2xl font-bold">{t("contact.form.success")}</h3>
                    <p className="mt-2 text-muted-foreground">{t("contact.form.successDesc")}</p>
                    <button
                      onClick={reset}
                      className="mt-6 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                    >
                      {t("contact.form.again")}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* progress */}
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("contact.step")} {step + 1} {t("contact.of")} 2
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <motion.div
                          animate={{ width: `${((step + 1) / 2) * 100}%` }}
                          transition={{ duration: 0.4 }}
                          className="h-full rounded-full"
                          style={{ background: "var(--gradient-brand)" }}
                        />
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {step === 0 ? (
                        <motion.div
                          key="s0"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <FloatingField
                            id="name"
                            label={t("contact.form.name")}
                            value={form.name}
                            onChange={(v) => set("name", v)}
                            error={errors.name}
                          />
                          <FloatingField
                            id="email"
                            label={t("contact.form.email")}
                            type="email"
                            value={form.email}
                            onChange={(v) => set("email", v)}
                            error={errors.email}
                          />
                          <FloatingField
                            id="phone"
                            label={t("contact.form.phone")}
                            value={form.phone}
                            onChange={(v) => set("phone", v)}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="s1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          {/* service select */}
                          <div className="relative">
                            <select
                              value={form.service}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) => set("service", e.target.value)}
                              className="w-full appearance-none rounded-2xl border border-border bg-card/50 px-4 py-4 text-sm outline-none transition-colors focus:border-primary"
                            >
                              <option value="">{t("contact.form.service.placeholder")}</option>
                              {services.map((s) => (
                                <option key={s} value={t(s)}>
                                  {t(s)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <FloatingField
                            id="message"
                            label={t("contact.form.message")}
                            value={form.message}
                            onChange={(v) => set("message", v)}
                            error={errors.message}
                            textarea
                          />

                          {/* dropzone */}
                          <div
                            onClick={() => fileRef.current?.click()}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={onDrop}
                            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60"
                            }`}
                          >
                            <input
                              ref={fileRef}
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFiles(e.target.files)}
                            />
                            {fileName ? (
                              <span className="flex items-center gap-2 text-sm font-medium text-primary">
                                <Paperclip className="h-4 w-4" />
                                {fileName}
                              </span>
                            ) : (
                              <>
                                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{t("contact.form.fileHint")}</span>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* actions */}
                    <div className="mt-6 flex items-center gap-3">
                      {step > 0 && (
                        <button
                          onClick={back}
                          className="flex items-center gap-1.5 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          {t("contact.back")}
                        </button>
                      )}
                      {step === 0 ? (
                        <button
                          onClick={next}
                          className="group ml-auto flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow"
                        >
                          {t("contact.next")}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      ) : (
                        <button
                          onClick={submit}
                          disabled={sending}
                          className="group ml-auto flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow disabled:opacity-70"
                        >
                          {sending ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                              {t("contact.form.sending")}
                            </>
                          ) : (
                            <>
                              {t("contact.form.submit")}
                              <Send className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
