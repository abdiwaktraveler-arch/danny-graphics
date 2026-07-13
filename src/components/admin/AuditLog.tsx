import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, ScrollText, Plus, Pencil, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AuditEntry } from "@/lib/audit.functions";

const ACTION_META: Record<
  string,
  { label: string; icon: typeof Plus; style: string }
> = {
  create: { label: "Created", icon: Plus, style: "bg-emerald-500/15 text-emerald-500" },
  update: { label: "Edited", icon: Pencil, style: "bg-blue-500/15 text-blue-500" },
  delete: { label: "Deleted", icon: Trash2, style: "bg-destructive/15 text-destructive" },
};

const ENTITY_LABEL: Record<string, string> = {
  work: "Work",
  site_text: "Site text",
  account: "Account",
};

export default function AuditLog() {
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("id,actor_email,action,entity,entity_id,summary,details,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setRows((data ?? []) as AuditEntry[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load the activity log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.summary.toLowerCase().includes(q) ||
        (r.actor_email ?? "").toLowerCase().includes(q) ||
        r.entity.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          A timestamped history of every change made in the dashboard.
        </p>
        <div className="flex items-center gap-2">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity..."
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

      {error && (
        <p className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading activity...
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <ScrollText className="mb-3 h-10 w-10 opacity-50" />
          <p className="font-medium">No activity yet</p>
          <p className="text-sm">Uploads, edits and deletions will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {visible.map((r) => {
            const meta = ACTION_META[r.action] ?? ACTION_META.update;
            const Icon = meta.icon;
            return (
              <div
                key={r.id}
                className="glass flex items-start gap-3 rounded-2xl p-4 shadow-soft"
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.style}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {ENTITY_LABEL[r.entity] ?? r.entity}
                    </span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium">
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{r.summary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                    {r.actor_email ? ` · ${r.actor_email}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
