import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save, Check, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, getStaticText, LANGUAGES, type Lang } from "@/lib/i18n";
import { EDITABLE_SECTIONS } from "@/lib/editable-content";
import { recordAudit } from "@/lib/audit.functions";

type ContentRow = { key: string; locale: string; value: string };

export default function SiteTextManager() {
  const { refreshContent } = useI18n();
  const logAudit = useServerFn(recordAudit);
  const [lang, setLang] = useState<Lang>("en");
  const [overrides, setOverrides] = useState<Record<string, Record<string, string>>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("site_content").select("key,locale,value");
      if (error) throw error;
      const map: Record<string, Record<string, string>> = {};
      (data as ContentRow[] | null)?.forEach((r) => {
        (map[r.locale] ??= {})[r.key] = r.value;
      });
      setOverrides(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Current value for a field = draft (if editing) → saved override → built-in default.
  const currentValue = (key: string) => {
    const draftKey = `${lang}:${key}`;
    if (draftKey in drafts) return drafts[draftKey];
    return overrides[lang]?.[key] ?? getStaticText(lang, key);
  };

  const isOverridden = (key: string) => Boolean(overrides[lang]?.[key]?.trim());

  const setDraft = (key: string, value: string) => {
    setDrafts((d) => ({ ...d, [`${lang}:${key}`]: value }));
    setSavedKey(null);
  };

  const save = async (key: string) => {
    const value = currentValue(key);
    setSavingKey(key);
    setError(null);
    try {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, locale: lang, value }, { onConflict: "key,locale" });
      if (error) throw error;
      setOverrides((o) => ({ ...o, [lang]: { ...(o[lang] ?? {}), [key]: value } }));
      setDrafts((d) => {
        const next = { ...d };
        delete next[`${lang}:${key}`];
        return next;
      });
      setSavedKey(key);
      refreshContent();
      await logAudit({
        data: {
          action: "update",
          entity: "site_text",
          entity_id: `${lang}:${key}`,
          summary: `Updated site text "${key}" (${lang})`,
        },
      }).catch(() => {});
      setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSavingKey(null);
    }
  };

  const resetToDefault = async (key: string) => {
    setSavingKey(key);
    setError(null);
    try {
      const { error } = await supabase
        .from("site_content")
        .delete()
        .eq("key", key)
        .eq("locale", lang);
      if (error) throw error;
      setOverrides((o) => {
        const langMap = { ...(o[lang] ?? {}) };
        delete langMap[key];
        return { ...o, [lang]: langMap };
      });
      setDrafts((d) => {
        const next = { ...d };
        delete next[`${lang}:${key}`];
        return next;
      });
      refreshContent();
      await logAudit({
        data: {
          action: "delete",
          entity: "site_text",
          entity_id: `${lang}:${key}`,
          summary: `Reset site text "${key}" to default (${lang})`,
        },
      }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed.");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading site text...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Edit the text shown on your public site. Changes go live instantly.
        </p>
        <div className="flex gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                lang === l.code
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border hover:bg-secondary"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-6">
        {EDITABLE_SECTIONS.map((section) => (
          <div key={section.title} className="glass rounded-2xl p-5 shadow-soft">
            <h3 className="mb-4 font-display text-base font-bold">{section.title}</h3>
            <div className="grid gap-4">
              {section.fields.map((field) => {
                const draftKey = `${lang}:${field.key}`;
                const dirty = draftKey in drafts && drafts[draftKey] !== (overrides[lang]?.[field.key] ?? getStaticText(lang, field.key));
                return (
                  <div key={field.key}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label className="text-sm font-medium">
                        {field.label}
                        {isOverridden(field.key) && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Customized
                          </span>
                        )}
                      </label>
                      <div className="flex items-center gap-1.5">
                        {isOverridden(field.key) && (
                          <button
                            disabled={savingKey === field.key}
                            onClick={() => resetToDefault(field.key)}
                            title="Reset to default"
                            className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                          >
                            <RotateCcw className="h-3 w-3" /> Reset
                          </button>
                        )}
                        <button
                          disabled={savingKey === field.key || !dirty}
                          onClick={() => save(field.key)}
                          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-40"
                        >
                          {savingKey === field.key ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : savedKey === field.key ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                          {savedKey === field.key ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                    {field.multiline ? (
                      <textarea
                        rows={3}
                        value={currentValue(field.key)}
                        onChange={(e) => setDraft(field.key, e.target.value)}
                        className="w-full resize-y rounded-xl border border-border bg-card/50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                      />
                    ) : (
                      <input
                        value={currentValue(field.key)}
                        onChange={(e) => setDraft(field.key, e.target.value)}
                        className="w-full rounded-xl border border-border bg-card/50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
