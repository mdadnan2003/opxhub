import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Users, Compass, Trophy, Briefcase, MessagesSquare, Bookmark, UserRound, Bell, Mail, Search, Settings, ShieldCheck,
} from "lucide-react";
import { Logo, UserAvatar, MockNote, SectionTitle, UserLink } from "./primitives";
import { me, hackathons, opportunities, users, daysLeft } from "@/lib/mock-data";
import { useStore, toggleIn } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const nav = [
  { to: "/feed", label: "Home", icon: Home },
  { to: "/network", label: "My Network", icon: Users },
  { to: "/discover", label: "Discover Students", icon: Compass },
  { to: "/hackathons", label: "Hackathons", icon: Trophy },
  { to: "/jobs", label: "Jobs & Internships", icon: Briefcase },
  { to: "/communities", label: "Communities", icon: MessagesSquare },
  { to: "/saved", label: "Saved Posts", icon: Bookmark },
  
] as const;

const mobileNav = [
  { to: "/feed", label: "Home", icon: Home },
  { to: "/network", label: "Network", icon: Users },
  { to: "/hackathons", label: "Hacks", icon: Trophy },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/messages", label: "Chat", icon: Mail },
] as const;

export function AppShell({ children, rightRail = true }: { children: React.ReactNode; rightRail?: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link to="/feed"><Logo /></Link>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search students, skills, hackathons…"
              className="h-10 w-full rounded-full border bg-muted pl-9 pr-4 text-sm outline-none focus:border-lime focus:bg-card"
            />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <IconLink to="/notifications" active={path === "/notifications"} label="Notifications" badge={3}><Bell /></IconLink>
            <IconLink to="/messages" active={path === "/messages"} label="Messages" badge={3}><Mail /></IconLink>
            <Link to="/profile/$id" params={{ id: me.id }} className="ml-2" aria-label="My profile">
              <UserAvatar user={me} size={34} />
            </Link>
          </div>
        </div>
      </header>

      <div className={cn("mx-auto grid max-w-7xl gap-6 px-4 py-6", rightRail ? "lg:grid-cols-[240px_1fr_300px]" : "lg:grid-cols-[240px_1fr]")}>
        <aside className="hidden lg:block">
          <div className="sticky top-22 space-y-4">
            <nav className="surface p-2">
              {nav.map((n) => {
                const active = path === n.to || (n.to !== "/feed" && path.startsWith(n.to));
                return (
                  <Link key={n.to} to={n.to} className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-lime-soft text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}>
                    {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-lime" />}
                    <n.icon className="size-4.5" />
                    {n.label}
                  </Link>
                );
              })}
              <Link to="/profile/$id" params={{ id: me.id }} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium", path.startsWith("/profile/" + me.id) ? "bg-lime-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><UserRound className="size-4.5" />My Profile</Link>
            </nav>
            <div className="surface flex items-center gap-3 p-3">
              <UserAvatar user={me} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{me.name}</p>
                <p className="truncate text-xs text-muted-foreground">{me.college}</p>
              </div>
              <Link to="/admin" aria-label="Admin" className="text-muted-foreground hover:text-foreground"><ShieldCheck className="size-4" /></Link>
              <Link to="/onboarding" aria-label="Settings" className="text-muted-foreground hover:text-foreground"><Settings className="size-4" /></Link>
            </div>
            <MockNote />
          </div>
        </aside>

        <main className="min-w-0">{children}</main>

        {rightRail && <RightRail />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card lg:hidden">
        {mobileNav.map((n) => {
          const active = path.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-foreground" : "text-muted-foreground")}>
              <span className={cn("rounded-full px-3 py-0.5", active && "bg-lime")}><n.icon className="size-5" /></span>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function IconLink({ to, children, label, badge, active }: { to: "/notifications" | "/messages"; children: React.ReactNode; label: string; badge?: number; active?: boolean }) {
  return (
    <Link to={to} aria-label={label} className={cn("relative grid size-10 place-items-center rounded-full hover:bg-muted [&_svg]:size-5", active && "bg-lime-soft")}>
      {children}
      {badge ? <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-lime text-[10px] font-bold text-lime-foreground">{badge}</span> : null}
    </Link>
  );
}

function RightRail() {
  const connected = useStore((s) => s.connected);
  const pending = useStore((s) => s.pending);
  const suggestions = users.filter((u) => u.id !== me.id && !connected.has(u.id)).slice(0, 3);
  return (
    <aside className="hidden space-y-4 lg:block">
      <div className="surface p-4">
        <SectionTitle action={<Link to="/jobs" className="text-xs font-medium text-muted-foreground hover:text-foreground">See all</Link>}>Trending opportunities</SectionTitle>
        <ul className="space-y-3">
          {opportunities.slice(0, 3).map((o) => (
            <li key={o.id} className="text-sm">
              <p className="font-semibold leading-tight">{o.title}</p>
              <p className="text-xs text-muted-foreground">{o.org} · {o.mode} · {daysLeft(o.deadline)}d left</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="surface p-4">
        <SectionTitle>Suggested connections</SectionTitle>
        <ul className="space-y-3">
          {suggestions.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <UserAvatar user={u} size={36} />
              <div className="min-w-0 flex-1">
                <UserLink user={u} className="block truncate text-sm" />
                <p className="truncate text-xs text-muted-foreground">{u.headline}</p>
              </div>
              <Button size="sm" variant={pending.has(u.id) ? "secondary" : "outline"} onClick={() => { toggleIn("pending", u.id); if (!pending.has(u.id)) toast.success(`Request sent to ${u.name}`); }}>
                {pending.has(u.id) ? "Pending" : "Connect"}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl bg-ink p-4 text-ink-foreground">
        <SectionTitle action={<Link to="/hackathons" className="text-xs text-lime">View</Link>}>Upcoming hackathons</SectionTitle>
        <ul className="space-y-3">
          {hackathons.slice(0, 3).map((h) => (
            <li key={h.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs opacity-60">{h.dates} · {h.mode}</p>
              </div>
              <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-lime-foreground">{daysLeft(h.deadline)}d</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
