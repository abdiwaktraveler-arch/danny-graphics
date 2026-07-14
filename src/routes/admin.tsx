import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LogOut,
  Loader2,
  Inbox,
  Mail,
  Phone,
  Paperclip,
  Trash2,
  RefreshCw,
  Search,
  Images,
  Type,
  ScrollText,
  KeyRound,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { BookingRow } from "@/lib/bookings.functions";
import WorksManager from "@/components/admin/WorksManager";
import SiteTextManager from "@/components/admin/SiteTextManager";
import AuditLog from "@/components/admin/AuditLog";
import ChangePassword from "@/components/admin/ChangePassword";


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Danny Graphics" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const STATUSES = ["new", "contacted", "in_progress", "done", "archived"] as const;
type Status = (typeof STATUSES)[number];
type Tab = "works" | "bookings" | "text" | "audit" | "settings";

const TABS: { id: Tab; label: string; icon: typeof Images }[] = [
  { id: "works", label: "Works", icon: Images },
  { id: "bookings", label: "Bookings", icon: Inbox },
  { id: "text", label: "Site Text", icon: Type },
  { id: "audit", label: "Activity", icon: ScrollText },
  { id: "settings", label: "Settings", icon: KeyRound },
];

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In progress",
  done: "Done",
  archived: "Archived",
};

const STATUS_STYLE: Record<Status, string> = {
  new: "bg-primary/15 text-primary",
  contacted: "bg-gold/15 text-gold",
  in_progress: "bg-blue-500/15 text-blue-500",
  done: "bg-emerald-500/15 text-emerald-500",
  archived: "bg-muted text-muted-foreground",
};

function AdminPage() {
  const [checking, setChecking] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const loadSession = async () => {
      setSessionError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const cachedEmail = sessionData.session?.user.email ?? null;
        if (alive && cachedEmail) setUserEmail(cachedEmail);
      } catch (error) {
        if (alive) {
          setUserEmail(null);
          setSessionError(
            error instanceof Error
              ? error.message
              : "Could not read your saved login. Please sign in again.",
          );
        }
      }
    };

    loadSession();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setUserEmail(session?.user.email ?? null);
    });

    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Opening admin dashboard...
      </div>
    );
  }

  if (!userEmail) {
    return <AdminLogin initialError={sessionError} onSignedIn={setUserEmail} />;
  }

  return <AdminDashboard userEmail={userEmail} onSignedOut={() => setUserEmail(null)} />;
}

function AdminLogin({
  initialError,
  onSignedIn,
}: {
  initialError: string | null;
  onSignedIn: (email: string) => void;
}) {
  const [email, setEmail] = useState("admin@dannygraphics.com");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const cleanEmail = email.trim();
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (signUpError) throw signUpError;
        setNotice("Account created. Signing you in now...");
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (signInError) throw signInError;
      onSignedIn(data.user?.email ?? cleanEmail);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not sign in. Please try again.";
      setError(
        message.toLowerCase().includes("invalid")
          ? "Email or password is wrong. If this is a new phone/account, tap Create account below first."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="glass w-full max-w-md rounded-2xl p-5 shadow-elegant sm:p-7">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase text-primary">Danny Graphics</p>
          <h1 className="mt-1 font-display text-2xl font-bold">Admin login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your admin email and password on any phone.</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              inputMode="email"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card/50 py-3.5 pl-11 pr-4 text-base outline-none transition-colors focus:border-primary sm:text-sm"
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card/50 py-3.5 pl-11 pr-4 text-base outline-none transition-colors focus:border-primary sm:text-sm"
            />
          </div>

          {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          {notice && <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Open admin dashboard" : "Create account and open dashboard"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === "signin" ? "signup" : "signin"));
            setError(null);
            setNotice(null);
          }}
          className="mt-5 w-full text-center text-sm font-semibold text-primary hover:underline"
        >
          {mode === "signin" ? "Create account for this phone" : "I already have an account"}
        </button>
      </div>
    </div>
  );
}

function AdminDashboard({ userEmail, onSignedOut }: { userEmail: string; onSignedOut: () => void }) {
  const [tab, setTab] = useState<Tab>("works");

  const signOut = async () => {
    await supabase.auth.signOut();
    onSignedOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h1 className="font-display text-lg font-bold">Admin dashboard</h1>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  tab === tb.id
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" /> {tb.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {tab === "works" && <WorksManager />}
        {tab === "bookings" && <BookingsPanel />}
        {tab === "text" && <SiteTextManager />}
        {tab === "audit" && <AuditLog />}
        {tab === "settings" && <ChangePassword />}
      </main>
    </div>
  );
}

function BookingsPanel() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const rows = await Promise.all(
        (data ?? []).map(async (b): Promise<BookingRow> => {
          let signed: string | null = null;
          if (b.attachment_url) {
            const { data: signedData } = await supabase.storage
              .from("booking-attachments")
              .createSignedUrl(b.attachment_url, 60 * 60);
            signed = signedData?.signedUrl ?? null;
          }
          return { ...b, attachment_signed_url: signed } as BookingRow;
        }),
      );

      setBookings(rows);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeStatus = async (id: string, status: Status) => {
    setBusyId(id);
    setBookings((b) => b.map((x) => (x.id === id ? { ...x, status } : x)));
    try {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    } catch {
      load();
    } finally {
      setBusyId(null);
    }
  };

  const removeBooking = async (id: string) => {
    if (!confirm("Delete this booking permanently?")) return;
    setBusyId(id);
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
      setBookings((b) => b.filter((x) => x.id !== id));
    } catch {
      load();
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    for (const s of STATUSES) c[s] = bookings.filter((b) => b.status === s).length;
    return c;
  }, [bookings]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        (b.message ?? "").toLowerCase().includes(q) ||
        (b.service ?? "").toLowerCase().includes(q)
      );
    });
  }, [bookings, filter, query]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filter === s
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border hover:bg-secondary"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]} <span className="opacity-60">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border border-border bg-card/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading bookings...
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <Inbox className="mb-3 h-10 w-10 opacity-50" />
          <p className="font-medium">No bookings here yet</p>
          <p className="text-sm">New requests will appear instantly.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence initial={false}>
            {visible.map((b) => (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="glass rounded-2xl p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">{b.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          STATUS_STYLE[(b.status as Status) ?? "new"] ?? STATUS_STYLE.new
                        }`}
                      >
                        {STATUS_LABEL[(b.status as Status) ?? "new"] ?? b.status}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                        <Mail className="h-3.5 w-3.5" /> {b.email}
                      </a>
                      {b.phone && (
                        <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                          <Phone className="h-3.5 w-3.5" /> {b.phone}
                        </a>
                      )}
                      {b.service && <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{b.service}</span>}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-secondary/50 p-3 text-sm">{b.message}</p>

                {b.attachment_signed_url && (
                  <a
                    href={b.attachment_signed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Paperclip className="h-4 w-4" /> View attachment
                  </a>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                  <span className="text-xs font-medium text-muted-foreground">Status:</span>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={busyId === b.id}
                      onClick={() => changeStatus(b.id, s)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all disabled:opacity-50 ${
                        b.status === s
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-secondary"
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                  <button
                    disabled={busyId === b.id}
                    onClick={() => removeBooking(b.id)}
                    className="ml-auto flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
