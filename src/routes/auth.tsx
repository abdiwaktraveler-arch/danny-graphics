import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IMAGES } from "@/lib/site";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Login — Danny Graphics" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        // auto-confirm is on; sign in immediately
        const { error: sErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (sErr) {
          setNotice("Account created. You can now sign in.");
          setMode("signin");
          return;
        }
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-16">
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass relative w-full max-w-md rounded-3xl p-8 shadow-elegant"
      >
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <img src={IMAGES.logo} alt="Danny Graphics" className="h-11 w-11 rounded-xl object-contain" />
          <div>
            <h1 className="font-display text-xl font-bold">Admin Access</h1>
            <p className="text-xs text-muted-foreground">Danny Graphics · Bookings</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card/50 py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card/50 py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
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
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode((m) => (m === "signin" ? "signup" : "signin"));
              setError(null);
              setNotice(null);
            }}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
