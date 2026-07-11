import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Loader2,
  ImagePlus,
  Trash2,
  Star,
  StarOff,
  ArrowUp,
  ArrowDown,
  ImageOff,
  Check,
  Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { WorkCategory } from "@/lib/site";

type WorkRow = {
  id: string;
  title: string;
  category: WorkCategory;
  image_path: string;
  featured: boolean;
  sort_order: number;
  url?: string;
};

const CATEGORIES: { id: WorkCategory; label: string }[] = [
  { id: "branding", label: "Branding" },
  { id: "poster", label: "Poster" },
  { id: "logo", label: "Logo" },
  { id: "social", label: "Social Media" },
];

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export default function WorksManager() {
  const [rows, setRows] = useState<WorkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // new-upload form
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WorkCategory>("branding");
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("works")
        .select("id,title,category,image_path,featured,sort_order")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      const list = (data ?? []) as WorkRow[];
      if (list.length) {
        const { data: signed } = await supabase.storage
          .from("work-images")
          .createSignedUrls(
            list.map((r) => r.image_path),
            60 * 60,
          );
        const byPath = new Map<string, string>();
        (signed ?? []).forEach((s) => s.path && s.signedUrl && byPath.set(s.path, s.signedUrl));
        list.forEach((r) => (r.url = byPath.get(r.image_path)));
      }
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load works.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickFile = (f: File | null) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("Image is too large (max 8MB).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setTitle("");
    setCategory("branding");
    setFeatured(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const upload = async () => {
    if (!file || !title.trim()) {
      setError("Add an image and a title.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("work-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const nextOrder = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
      const { error: insErr } = await supabase.from("works").insert({
        title: title.trim(),
        category,
        image_path: path,
        featured,
        sort_order: nextOrder,
      });
      if (insErr) {
        await supabase.storage.from("work-images").remove([path]);
        throw insErr;
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (row: WorkRow) => {
    if (!confirm(`Delete "${row.title}" permanently?`)) return;
    setBusyId(row.id);
    try {
      const { error } = await supabase.from("works").delete().eq("id", row.id);
      if (error) throw error;
      await supabase.storage.from("work-images").remove([row.image_path]);
      setRows((r) => r.filter((x) => x.id !== row.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  };

  const patch = async (
    row: WorkRow,
    changes: Partial<Pick<WorkRow, "title" | "category" | "featured" | "sort_order">>,
  ) => {
    setBusyId(row.id);
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, ...changes } : x)));
    try {
      const { error } = await supabase.from("works").update(changes).eq("id", row.id);
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
      load();
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const a = rows[index];
    const b = rows[target];
    setBusyId(a.id);
    // swap sort_order values
    const aOrder = a.sort_order;
    const bOrder = b.sort_order;
    const nextRows = [...rows];
    nextRows[index] = { ...b, sort_order: aOrder };
    nextRows[target] = { ...a, sort_order: bOrder };
    nextRows.sort((x, y) => x.sort_order - y.sort_order);
    setRows(nextRows);
    try {
      await Promise.all([
        supabase.from("works").update({ sort_order: bOrder }).eq("id", a.id),
        supabase.from("works").update({ sort_order: aOrder }).eq("id", b.id),
      ]);
    } catch {
      load();
    } finally {
      setBusyId(null);
    }
  };

  const catLabel = useMemo(
    () => (id: WorkCategory) => CATEGORIES.find((c) => c.id === id)?.label ?? id,
    [],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      {/* Upload panel */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass rounded-2xl p-5 shadow-soft">
          <h3 className="mb-4 font-display text-base font-bold">Add a new work</h3>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-card/40 text-muted-foreground transition-colors hover:border-primary"
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm">
                <ImagePlus className="h-7 w-7" />
                Click to choose an image
                <span className="text-xs opacity-70">JPG / PNG / WEBP · max 8MB</span>
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />

          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (e.g. Nurobe Hotel Poster)"
              maxLength={120}
              className="w-full rounded-xl border border-border bg-card/50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    category === c.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Feature (larger tile in the grid)
            </label>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
            )}

            <button
              type="button"
              disabled={uploading}
              onClick={upload}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Publish work"}
            </button>
          </div>
        </div>
      </div>

      {/* Existing works */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading works...
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center text-muted-foreground">
            <ImageOff className="mb-3 h-10 w-10 opacity-50" />
            <p className="font-medium">No works uploaded yet</p>
            <p className="text-sm">Add your first photo — it appears on your site instantly.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {rows.map((row, i) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="glass overflow-hidden rounded-2xl shadow-soft"
                >
                  <div className="relative aspect-video overflow-hidden bg-secondary/40">
                    {row.url ? (
                      <img src={row.url} alt={row.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageOff className="h-6 w-6" />
                      </div>
                    )}
                    {row.featured && (
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-bold text-accent">
                        <Star className="h-3 w-3" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <EditableTitle row={row} onSave={(title) => patch(row, { title })} busy={busyId === row.id} />
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.id}
                          disabled={busyId === row.id}
                          onClick={() => patch(row, { category: c.id })}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all disabled:opacity-50 ${
                            row.category === c.id
                              ? "bg-primary text-primary-foreground"
                              : "border border-border hover:bg-secondary"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 border-t border-border/60 pt-2">
                      <button
                        disabled={busyId === row.id}
                        onClick={() => patch(row, { featured: !row.featured })}
                        title={row.featured ? "Unfeature" : "Feature"}
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-secondary disabled:opacity-50"
                      >
                        {row.featured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        disabled={busyId === row.id || i === 0}
                        onClick={() => move(i, -1)}
                        title="Move up"
                        className="flex items-center rounded-full px-2 py-1 text-xs transition-colors hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        disabled={busyId === row.id || i === rows.length - 1}
                        onClick={() => move(i, 1)}
                        title="Move down"
                        className="flex items-center rounded-full px-2 py-1 text-xs transition-colors hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <span className="ml-1 text-[11px] text-muted-foreground">{catLabel(row.category)}</span>
                      <button
                        disabled={busyId === row.id}
                        onClick={() => remove(row)}
                        className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function EditableTitle({
  row,
  onSave,
  busy,
}: {
  row: WorkRow;
  onSave: (title: string) => void;
  busy: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(row.title);

  useEffect(() => setValue(row.title), [row.title]);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex w-full items-center gap-1.5 text-left font-display text-sm font-semibold hover:text-primary"
      >
        <span className="truncate">{row.title}</span>
        <Pencil className="h-3 w-3 shrink-0 opacity-50" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={value}
        maxLength={120}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSave(value.trim() || row.title);
            setEditing(false);
          }
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-full rounded-lg border border-border bg-card/50 px-2 py-1 text-sm outline-none focus:border-primary"
      />
      <button
        disabled={busy}
        onClick={() => {
          onSave(value.trim() || row.title);
          setEditing(false);
        }}
        className="rounded-md p-1 text-primary hover:bg-primary/10"
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
}
