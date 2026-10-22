import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Chrome, Eye, EyeOff } from "lucide-react";
import { AuthLayout, inputCls } from "@/components/opx/AuthLayout";
import { Button } from "@/components/ui/button";
import { INTERESTS } from "@/lib/mock-data";
import {
  normalizeAuthErrorMessage,
  signUpWithGoogle,
  signUpWithSupabase,
  validatePasswordStrength,
} from "@/lib/auth";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => seo("Join OPXHUB", "Create your student profile on OPXHUB."),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [gradYear, setGradYear] = useState("2027");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signUpWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-up failed.";
      setError(normalizeAuthErrorMessage(message));
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validationError = validatePasswordStrength(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await signUpWithSupabase({
        fullName,
        email,
        password,
        college,
        degree,
        gradYear: Number(gradYear || 2027),
        interests,
      });
      nav({ to: "/feed" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create your account.";
      setError(normalizeAuthErrorMessage(message));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute.">
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className={inputCls}
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          className={inputCls}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <input
            className={`${inputCls} pr-11`}
            type={showPassword ? "text" : "password"}
            placeholder="Password (8+, uppercase, number, symbol)"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <input
          className={inputCls}
          placeholder="College / university"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className={inputCls}
            placeholder="Course"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            required
          />
          <input
            className={inputCls}
            type="number"
            placeholder="Grad year"
            min={2024}
            max={2032}
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            required
          />
        </div>
        <p className="pt-2 text-sm font-semibold">Interests</p>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button
              type="button"
              key={i}
              onClick={() =>
                setInterests((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                interests.includes(i) && "border-lime bg-lime text-lime-foreground",
              )}
            >
              {i}
            </button>
          ))}
        </div>
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        <Button variant="lime" size="lg" className="mt-2 w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Continue"}
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
        Already a member?{" "}
        <Link to="/login" className="font-semibold text-foreground hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
