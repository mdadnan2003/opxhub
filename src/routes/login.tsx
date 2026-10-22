import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Chrome } from "lucide-react";
import { AuthLayout, inputCls } from "@/components/opx/AuthLayout";
import { Button } from "@/components/ui/button";
import { normalizeAuthErrorMessage, signInWithGoogle, signInWithSupabase } from "@/lib/auth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => seo("Log in", "Log in to OPXHUB."),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("mdadnaniftekhari@gmail.com");
  const [password, setPassword] = useState("adnan786");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(normalizeAuthErrorMessage(message));
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithSupabase({ email, password });
      const next = new URLSearchParams(window.location.search).get("next") || "/feed";
      nav({ to: next as string });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid email or password.";
      setError(normalizeAuthErrorMessage(message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your OPXHUB account.">
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className={inputCls}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={inputCls}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button variant="lime" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </Button>
        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="bg-card px-2">or</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGoogle}
          disabled={googleLoading || submitting}
        >
          <Chrome className="mr-2 size-4" />{" "}
          {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/signup" className="font-semibold text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
