import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Lock, Check, KeyRound, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { recordAudit } from "@/lib/audit.functions";

export default function ChangePassword() {
  const logAudit = useServerFn(recordAudit);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      // Re-verify identity with the current password before allowing the change.
      // Because you're already signed in, this uses your active session — no
      // password reset email or account recovery is required.
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) throw new Error("Your session has expired. Please sign in again.");

      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (verifyErr) throw new Error("Your current password is incorrect.");

      const { error: updErr } = await supabase.auth.updateUser({ password: next });
      if (updErr) throw updErr;

      await logAudit({
        data: {
          action: "update",
          entity: "account",
          summary: "Changed admin password",
        },
      }).catch(() => {});

      setCurrent("");
      setNext("");
      setConfirm("");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSaving(false);
    }
  };

  const inputType = show ? "text" : "password";

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-2xl p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold">Change password</h3>
            <p className="text-xs text-muted-foreground">Update your admin login credentials.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <PasswordField
            icon={<Lock className="h-4 w-4" />}
            type={inputType}
            placeholder="Current password"
            value={current}
            onChange={setCurrent}
          />
          <PasswordField
            icon={<Lock className="h-4 w-4" />}
            type={inputType}
            placeholder="New password (min 8 characters)"
            value={next}
            onChange={setNext}
          />
          <PasswordField
            icon={<Lock className="h-4 w-4" />}
            type={inputType}
            placeholder="Confirm new password"
            value={confirm}
            onChange={setConfirm}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {show ? "Hide passwords" : "Show passwords"}
            </button>
          </label>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          {done && (
            <p className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
              <Check className="h-4 w-4" /> Password updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {saving ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordField({
  icon,
  type,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        className="w-full rounded-2xl border border-border bg-card/50 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}
