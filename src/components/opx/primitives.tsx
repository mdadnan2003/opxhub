import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/mock-data";

export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span className={cn("font-display text-xl font-bold tracking-tight", dark ? "text-ink-foreground" : "text-foreground", className)}>
      OP<span className="text-lime">X</span>HUB
    </span>
  );
}

export function UserAvatar({ user, size = 40, ring = false }: { user: Pick<User, "name" | "id">; size?: number; ring?: boolean }) {
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  const tone = user.id.charCodeAt(0) % 2 === 0;
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold",
        tone ? "bg-ink text-lime" : "bg-lime text-lime-foreground",
        ring && "ring-4 ring-card",
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function UserLink({ user, className }: { user: User; className?: string }) {
  return (
    <Link to="/profile/$id" params={{ id: user.id }} className={cn("font-semibold hover:underline", className)}>
      {user.name}
    </Link>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold">{children}</h3>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="surface mb-4 flex flex-wrap items-center justify-between gap-3 p-5">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function MockNote() {
  return (
    <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
      Preview mode · sample data only. Posting, messaging and sign-in are not connected to a backend yet.
    </p>
  );
}
