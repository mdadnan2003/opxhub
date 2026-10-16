import { Link } from "@tanstack/react-router";
import { Logo } from "./primitives";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-10 text-ink-foreground lg:flex">
        <Link to="/"><Logo dark /></Link>
        <div>
          <p className="font-display text-4xl font-bold leading-tight">Where students <span className="text-lime">build together.</span></p>
          <p className="mt-4 max-w-sm opacity-60">Join thousands of builders sharing projects, forming teams and landing opportunities.</p>
        </div>
        <p className="text-xs opacity-40">Preview mode — sign-in isn't connected yet.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden"><Logo /></Link>
          <h1 className="mt-6 text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const inputCls = "h-11 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:border-lime focus:ring-2 focus:ring-lime/30";
