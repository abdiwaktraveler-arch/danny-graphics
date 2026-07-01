import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Mail,
  Sparkles,
  Bot,
  Plus,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CONTACT, IMAGES } from "@/lib/site";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatBot() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "contact">("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming, open, tab]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;

    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      // Surface actionable server errors (e.g. missing env var / API key) to the user.
      if (!res.ok) {
        let friendly = t("chat.error");
        try {
          const data = (await res.clone().json()) as { error?: string };
          if (data?.error) friendly = data.error;
        } catch {
          /* non-JSON error body — keep generic message */
        }
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: friendly };
          return copy;
        });
        return;
      }

      if (!res.body) throw new Error("bad response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      if (!acc.trim()) throw new Error("empty");
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: t("chat.error") };
        return copy;
      });
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const suggestions = [t("chat.suggest1"), t("chat.suggest2"), t("chat.suggest3")];

  const contactItems = [
    { icon: Phone, label: t("widget.call"), value: CONTACT.phone, href: CONTACT.phoneHref, c: "var(--gradient-brand)" },
    { icon: Send, label: "Telegram", value: CONTACT.bizTelegram, href: CONTACT.bizTelegramHref, c: "var(--gradient-brand)" },
    { icon: Mail, label: t("contact.email"), value: CONTACT.email, href: CONTACT.emailHref, c: "var(--gradient-gold)" },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="glass flex h-[32rem] max-h-[78vh] w-[min(92vw,23rem)] flex-col overflow-hidden rounded-3xl shadow-elegant"
          >
            {/* header */}
            <div className="relative overflow-hidden p-4" style={{ background: "var(--gradient-brand)" }}>
              <div className="relative z-10 flex items-center gap-3 text-primary-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold leading-tight">{t("chat.title")}</p>
                  <p className="flex items-center gap-1.5 text-[11px] opacity-90">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    {t("chat.status")}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 transition-colors hover:bg-white/20"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sparkles className="absolute -right-2 -top-2 h-16 w-16 text-white/10" />
            </div>

            {/* tabs */}
            <div className="flex border-b border-border/60 px-2 pt-2">
              {(["chat", "contact"] as const).map((tb) => (
                <button
                  key={tb}
                  onClick={() => setTab(tb)}
                  className={`relative flex-1 rounded-t-xl px-3 py-2 text-sm font-medium transition-colors ${
                    tab === tb ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tb === "chat" ? t("chat.tabChat") : t("chat.tabContact")}
                  {tab === tb && (
                    <motion.span
                      layoutId="chatTab"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                      style={{ background: "var(--gradient-brand)" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {tab === "chat" ? (
              <>
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                  {/* greeting */}
                  <div className="flex gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-2.5 text-sm">
                      {t("chat.greeting")}
                    </div>
                  </div>

                  {messages.map((m, i) =>
                    m.role === "user" ? (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                      >
                        <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                          {m.content}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-2.5 text-sm">
                          {m.content ||
                            (streaming && i === messages.length - 1 ? (
                              <span className="inline-flex gap-1">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                              </span>
                            ) : (
                              ""
                            ))}
                        </div>
                      </motion.div>
                    ),
                  )}

                  {messages.length === 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex items-center gap-2 border-t border-border/60 p-3"
                >
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMessages([])}
                      title={t("chat.clear")}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("chat.placeholder")}
                    className="min-w-0 flex-1 rounded-full border border-border bg-card/50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={streaming || !input.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-soft transition-all hover:shadow-glow disabled:opacity-50"
                    style={{ background: "var(--gradient-brand)" }}
                    aria-label={t("chat.send")}
                  >
                    {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                <div className="mb-1 flex items-center gap-3">
                  <img src={IMAGES.logo} alt="Danny Graphics" className="h-10 w-10 rounded-xl object-contain" />
                  <div>
                    <p className="font-display text-sm font-bold">{CONTACT.bizTelegram}</p>
                    <p className="text-xs text-muted-foreground">{t("contact.locationValue")}</p>
                  </div>
                </div>
                {contactItems.map((c, i) => (
                  <motion.a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-3 transition-all hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground"
                      style={{ background: c.c }}
                    >
                      <c.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="truncate text-sm font-medium">{c.value}</p>
                    </div>
                  </motion.a>
                ))}
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow"
                >
                  {t("nav.book")}
                </a>
              </div>
            )}
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
        aria-label={t("chat.fab")}
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
