import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Users,
  Compass,
  Trophy,
  Briefcase,
  MessagesSquare,
  Bookmark,
  UserRound,
  Bell,
  Mail,
  Search,
  Settings,
  ShieldCheck,
  GitBranch,
  LogOut,
  Sparkles,
  UserCog,
  BriefcaseBusiness,
  Link2,
  ChevronDown,
} from "lucide-react";
import { BrandLogo, Logo, UserAvatar, MockNote, SectionTitle, UserLink } from "./primitives";
import { me as fallbackMe, hackathons, opportunities, users, daysLeft } from "@/lib/mock-data";
import { useStore, toggleIn, updateProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMe } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { signOutUser } from "@/lib/auth";

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
  { to: "/opensource", label: "Open Source", icon: GitBranch },
] as const;

const desktopNav = [
  { to: "/feed", label: "Home", icon: Home },
  { to: "/network", label: "My Network", icon: Users },
  { to: "/discover", label: "Discover Students", icon: Compass },
  { to: "/hackathons", label: "Hackathons", icon: Trophy },
  { to: "/jobs", label: "Jobs & Internships", icon: Briefcase },
  { to: "/opensource", label: "Open Source", icon: GitBranch },
  { to: "/saved", label: "Saved Posts", icon: Bookmark },
] as const;

export function AppShell({
  children,
  rightRail = true,
}: {
  children: React.ReactNode;
  rightRail?: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const opportunities = useStore((s) => s.opportunities);
  const hackathons = useStore((s) => s.hackathons);
  const qc = useQueryClient();
  const { profile } = useMe();
  const profileOverrides = useStore((s) => s.profileOverrides);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({
    headline: profile?.headline ?? "Student builder",
    location: profile?.location ?? "",
    about: profile?.about ?? "",
    college: profile?.college ?? "Campus",
    degree: profile?.course ?? "Student",
    year: String(profile?.grad_year ?? 2027),
    skills: profile?.skills ?? ["React", "Product", "Design"],
  });

  const actualMe: {
    id: string;
    name: string;
    headline: string;
    college: string;
    degree: string;
    year: number;
    location?: string | null | undefined;
    about?: string | null | undefined;
    skills: string[];
    connections: number;
  } = profile
    ? {
        id: profile.id,
        name: profile.full_name || "Member",
        headline: profileOverrides[profile.id]?.headline ?? (profile.headline || "Student builder"),
        college: profileOverrides[profile.id]?.college ?? (profile.college || "Campus"),
        degree: profileOverrides[profile.id]?.degree ?? (profile.course || "Student"),
        year: profileOverrides[profile.id]?.year ?? (profile.grad_year || 2027),
        location: profileOverrides[profile.id]?.location ?? profile.location ?? undefined,
        about: profileOverrides[profile.id]?.about ?? profile.about ?? undefined,
        skills: profileOverrides[profile.id]?.skills ?? (profile.skills || []),
        connections: 0,
      }
    : {
        ...fallbackMe,
        location: fallbackMe.location,
        about: undefined,
        skills: fallbackMe.skills,
        connections: fallbackMe.connections,
      };

  React.useEffect(() => {
    if (profile) {
      setDraft({
        headline: profileOverrides[profile.id]?.headline ?? profile.headline ?? "Student builder",
        location: profileOverrides[profile.id]?.location ?? profile.location ?? "",
        about: profileOverrides[profile.id]?.about ?? profile.about ?? "",
        college: profileOverrides[profile.id]?.college ?? profile.college ?? "Campus",
        degree: profileOverrides[profile.id]?.degree ?? profile.course ?? "Student",
        year: String(profileOverrides[profile.id]?.year ?? profile.grad_year ?? 2027),
        skills: profileOverrides[profile.id]?.skills ??
          profile.skills ?? ["React", "Product", "Design"],
      });
    }
  }, [profile, profileOverrides]);

  const saveProfile = async () => {
    if (!profile) return;
    const nextSkills = (draft.skills ?? []).map((s) => s.trim()).filter(Boolean);
    const payload = {
      headline: draft.headline.trim() || actualMe.headline,
      location: draft.location.trim() ? draft.location.trim() : null,
      about: draft.about.trim() ? draft.about.trim() : "",
      college: draft.college.trim() || actualMe.college,
      course: draft.degree.trim() || actualMe.degree,
      grad_year: Number(draft.year) || actualMe.year,
      skills: nextSkills.length ? nextSkills : ["React", "Product", "Design"],
      full_name: profile.full_name || actualMe.name,
    };

    updateProfile(profile.id, {
      headline: payload.headline,
      location: payload.location ?? undefined,
      about: payload.about || undefined,
      college: payload.college,
      degree: payload.course,
      year: payload.grad_year,
      skills: payload.skills,
    });

    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    if (error) {
      toast.error("Could not save profile");
      return;
    }

    qc.invalidateQueries({ queryKey: ["profile", profile.id] });
    qc.invalidateQueries({ queryKey: ["profiles"] });
    setIsEditing(false);
    setProfileOpen(true);
    toast.success("Profile updated");
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast.success("Signed out successfully");
      await router.navigate({ to: "/login" });
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link to="/feed" className="shrink-0">
            <BrandLogo className="h-9 w-auto max-w-[160px]" />
          </Link>
          <div className="relative hidden max-w-xl flex-1 md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search students, skills, hackathons…"
              className="h-10 w-full rounded-full border border-border bg-muted/80 pl-9 pr-4 text-sm text-foreground outline-none transition focus:border-lime focus:bg-card focus:ring-2 focus:ring-lime/20"
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <IconLink
              to="/notifications"
              active={path === "/notifications"}
              label="Notifications"
              badge={3}
            >
              <Bell />
            </IconLink>
            <IconLink to="/messages" active={path === "/messages"} label="Messages" badge={3}>
              <Mail />
            </IconLink>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-2 inline-flex items-center gap-2 rounded-full border border-transparent bg-transparent px-1.5 py-1 text-left transition hover:border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-lime/40"
                  aria-label="Account menu"
                >
                  <UserAvatar user={{ id: actualMe.id, name: actualMe.name }} size={34} />
                  <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-2xl border border-border bg-popover p-2 shadow-[0_18px_45px_-20px_rgba(0,0,0,0.35)]"
              >
                <DropdownMenuLabel className="px-2 py-2">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={{ id: actualMe.id, name: actualMe.name }} size={42} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {actualMe.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{actualMe.name.toLowerCase().replace(/\s+/g, "")}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile/$id"
                    params={{ id: actualMe.id }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <UserRound className="size-4" /> View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings/profile"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <UserCog className="size-4" /> Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings/projects"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <Sparkles className="size-4" /> My Projects
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings/connections"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <Link2 className="size-4" /> GitHub & Social Links
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings/account"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <Settings className="size-4" /> Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    void handleSignOut();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <LogOut className="size-4" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "mx-auto grid max-w-7xl gap-6 px-4 py-6",
          rightRail ? "lg:grid-cols-[240px_1fr_300px]" : "lg:grid-cols-[240px_1fr]",
        )}
      >
        <aside className="hidden lg:block">
          <div className="sticky top-22 space-y-4">
            <nav className="surface overflow-hidden p-2">
              {desktopNav.map((n) => {
                const active = path === n.to || (n.to !== "/feed" && path.startsWith(n.to));
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-lime-soft text-foreground shadow-[inset_0_0_0_1px_rgba(166,255,0,0.18)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-lime" />
                    )}
                    <n.icon className="size-4.5" />
                    {n.label}
                  </Link>
                );
              })}
              <Link
                to="/profile/$id"
                params={{ id: actualMe.id }}
                className={cn(
                  "mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  path.startsWith("/profile/" + actualMe.id)
                    ? "bg-lime-soft text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <UserRound className="size-4.5" />
                My Profile
              </Link>
            </nav>
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="surface flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted/60"
            >
              <UserAvatar user={{ id: actualMe.id, name: actualMe.name }} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{actualMe.name}</p>
                <p className="truncate text-xs text-muted-foreground">{actualMe.college}</p>
              </div>
              <Link
                to="/admin"
                aria-label="Admin"
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <ShieldCheck className="size-4" />
              </Link>
              <Link
                to="/settings/account"
                aria-label="Settings"
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <Settings className="size-4" />
              </Link>
            </button>
            <MockNote />
          </div>
        </aside>

        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit profile" : "Your profile"}</DialogTitle>
            </DialogHeader>
            {isEditing ? (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Headline</label>
                  <Input
                    value={draft.headline}
                    onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">College</label>
                    <Input
                      value={draft.college}
                      onChange={(e) => setDraft((d) => ({ ...d, college: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Degree</label>
                    <Input
                      value={draft.degree}
                      onChange={(e) => setDraft((d) => ({ ...d, degree: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={draft.location}
                      onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Graduation year</label>
                    <Input
                      type="number"
                      value={draft.year}
                      onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">About</label>
                  <Textarea
                    value={draft.about}
                    onChange={(e) => setDraft((d) => ({ ...d, about: e.target.value }))}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {(draft.skills ?? []).map((skill, index) => (
                      <span key={`${skill}-${index}`} className="chip flex items-center gap-2">
                        {skill}
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              skills: (d.skills ?? []).filter((_, i) => i !== index),
                            }))
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add skill"
                      onKeyDown={(e) => {
                        const value = (e.currentTarget.value ?? "").trim();
                        if (e.key === "Enter" && value) {
                          e.preventDefault();
                          setDraft((d) => ({ ...d, skills: [...(d.skills ?? []), value] }));
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector(
                          "input",
                        ) as HTMLInputElement | null;
                        const value = input?.value?.trim();
                        if (!value) return;
                        setDraft((d) => ({ ...d, skills: [...(d.skills ?? []), value] }));
                        if (input) input.value = "";
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="lime" onClick={saveProfile}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <UserAvatar user={{ id: actualMe.id, name: actualMe.name }} size={68} ring />
                  <div>
                    <h3 className="text-xl font-bold">{actualMe.name}</h3>
                    <p className="text-sm text-muted-foreground">{actualMe.headline}</p>
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-foreground">College:</span>{" "}
                    {actualMe.college}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Degree:</span> {actualMe.degree}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Year:</span> {actualMe.year}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Location:</span>{" "}
                    {actualMe.location ?? "Not added"}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">About</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {actualMe.about ??
                      "Student builder exploring new ideas and building in public."}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(actualMe.skills?.length
                      ? actualMe.skills
                      : ["React", "Product", "Design"]
                    ).map((skill) => (
                      <span key={skill} className="chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setProfileOpen(false)}>
                    Close
                  </Button>
                  <Button
                    variant="lime"
                    onClick={() => {
                      setIsEditing(true);
                      setDraft({
                        headline: actualMe.headline,
                        location: actualMe.location ?? "",
                        about: actualMe.about ?? "",
                        college: actualMe.college,
                        degree: actualMe.degree,
                        year: String(actualMe.year),
                        skills: actualMe.skills?.length
                          ? actualMe.skills
                          : ["React", "Product", "Design"],
                      });
                    }}
                  >
                    Edit profile
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <main className="min-w-0">{children}</main>

        {rightRail && <RightRail />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card lg:hidden">
        {mobileNav.map((n) => {
          const active = path.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className={cn("rounded-full px-3 py-0.5", active && "bg-lime")}>
                <n.icon className="size-5" />
              </span>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function IconLink({
  to,
  children,
  label,
  badge,
  active,
}: {
  to: "/notifications" | "/messages";
  children: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        "relative grid size-10 place-items-center rounded-full hover:bg-muted [&_svg]:size-5",
        active && "bg-lime-soft",
      )}
    >
      {children}
      {badge ? (
        <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-lime text-[10px] font-bold text-lime-foreground">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function RightRail() {
  const connected = useStore((s) => s.connected);
  const pending = useStore((s) => s.pending);
  const { profile } = useMe();
  const meId = profile?.id ?? fallbackMe.id;
  const suggestions = users.filter((u) => u.id !== meId && !connected.has(u.id)).slice(0, 3);
  return (
    <aside className="hidden space-y-4 lg:block">
      <div className="surface p-4">
        <SectionTitle
          action={
            <Link
              to="/jobs"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              See all
            </Link>
          }
        >
          Trending opportunities
        </SectionTitle>
        <ul className="space-y-3">
          {opportunities.slice(0, 3).map((o) => (
            <li key={o.id} className="text-sm">
              <p className="font-semibold leading-tight">{o.title}</p>
              <p className="text-xs text-muted-foreground">
                {o.org} · {o.mode} · {daysLeft(o.deadline)}d left
              </p>
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
              <Button
                size="sm"
                variant={pending.has(u.id) ? "secondary" : "outline"}
                onClick={() => {
                  toggleIn("pending", u.id);
                  if (!pending.has(u.id)) toast.success(`Request sent to ${u.name}`);
                }}
              >
                {pending.has(u.id) ? "Pending" : "Connect"}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl bg-ink p-4 text-ink-foreground">
        <SectionTitle
          action={
            <Link to="/hackathons" className="text-xs text-lime">
              View
            </Link>
          }
        >
          Upcoming hackathons
        </SectionTitle>
        <ul className="space-y-3">
          {hackathons.slice(0, 3).map((h) => (
            <li key={h.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs opacity-60">
                  {h.dates} · {h.mode}
                </p>
              </div>
              <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-lime-foreground">
                {daysLeft(h.deadline)}d
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
