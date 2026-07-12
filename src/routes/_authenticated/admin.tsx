import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
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
  ShieldAlert,
  Search,
  Images,
  Type,
  ScrollText,
  KeyRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ensureAdmin,
  getBookings,
  updateBookingStatus,
  deleteBooking,
  type BookingRow,
} from "@/lib/bookings.functions";
import WorksManager from "@/components/admin/WorksManager";
import SiteTextManager from "@/components/admin/SiteTextManager";
import AuditLog from "@/components/admin/AuditLog";
import ChangePassword from "@/components/admin/ChangePassword";


export const Route = createFileRoute("/_authenticated/admin")({
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
  const navigate = useNavigate();
  const callEnsureAdmin = useServerFn(ensureAdmin);

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [checkFailed, setCheckFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("works");

  const runCheck = () => {
    setChecking(true);
    setCheckFailed(false);
    callEnsureAdmin()
      .then((res) => setAuthorized(res.isAdmin))
      .catch(() => {
        // A thrown error here means the access check couldn't complete
        // (e.g. missing server env vars on the host, or a network drop) —
        // this is different from being a signed-in non-admin.
        setAuthorized(false);
        setCheckFailed(true);
      })
      .finally(() => setChecking(false));
  };

  useEffect(() => {
    runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking access...
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="glass max-w-md rounded-3xl p-8 text-center shadow-elegant">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          {checkFailed ? (
            <>
              <h1 className="font-display text-xl font-bold">Couldn't verify access</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We couldn't reach the server to confirm your admin access. Check your
                connection and try again. If this keeps happening on your published
                site, the server environment variables may be missing.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  onClick={runCheck}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow"
                >
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
                <button
                  onClick={signOut}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-xl font-bold">Not authorized</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This account doesn't have admin access to the dashboard.
              </p>
              <button
                onClick={signOut}
                className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h1 className="font-display text-lg font-bold">Admin dashboard</h1>
            <p className="text-xs text-muted-foreground">Danny Graphics</p>
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
  const callGetBookings = useServerFn(getBookings);
  const callUpdate = useServerFn(updateBookingStatus);
  const callDelete = useServerFn(deleteBooking);

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await callGetBookings();
      setBookings(data);
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
      await callUpdate({ data: { id, status } });
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
      await callDelete({ data: { id } });
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
