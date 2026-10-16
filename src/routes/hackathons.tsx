import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Calendar, ExternalLink, Plus } from "lucide-react";
import { AppShell } from "@/components/opx/AppShell";
import { PageHeader, UserAvatar, UserLink } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { hackathons, teamPosts as seed, getUser, daysLeft, me, type TeamPost } from "@/lib/mock-data";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hackathons")({
  head: () => seo("Hackathons & Team Finder", "Discover upcoming hackathons and find teammates with the skills you need."),
  component: Hackathons,
});

function Hackathons() {
  const [mode, setMode] = useState<"All" | "Online" | "Offline">("All");
  const [teams, setTeams] = useState<TeamPost[]>(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ hackathon: hackathons[0].name, idea: "", roles: "", size: "1/4" });
  const list = hackathons.filter((h) => mode === "All" || h.mode === mode);
  const inp = "h-10 w-full rounded-lg border bg-muted px-3 text-sm outline-none focus:border-lime";
  return (
    <AppShell>
      <PageHeader title="Hackathons" subtitle="Upcoming events and teams looking for builders." />
      <div className="mb-4 flex gap-2">
        {(["All", "Online", "Offline"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={cn("rounded-full border bg-card px-4 py-1.5 text-sm font-medium", mode === m && "border-lime bg-lime text-lime-foreground")}>{m}</button>
        ))}
      </div>
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {list.map((h) => (
          <div key={h.id} className="surface p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg font-semibold">{h.name}</p>
                <p className="text-xs text-muted-foreground">by {h.org}</p>
              </div>
              <span className="chip">{h.mode}</span>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Calendar className="size-4" />{h.dates} · Register in <b className="text-foreground">{daysLeft(h.deadline)} days</b></p>
              {h.location && <p className="flex items-center gap-2"><MapPin className="size-4" />{h.location}</p>}
              <p>Prize pool: {h.prize ? <b className="text-foreground">{h.prize}</b> : "Not announced officially"}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">{h.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="lime" onClick={() => toast("Official registration links will be added by admins")}>Register <ExternalLink /></Button>
              <Button size="sm" variant="outline" onClick={() => { setForm({ ...form, hackathon: h.name }); setOpen(true); }}>Find teammates</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl bg-ink p-5 text-ink-foreground">
        <div>
          <h2 className="text-xl font-bold">Find Your <span className="text-lime">Team</span></h2>
          <p className="text-sm opacity-70">Post what you're building and the roles you need.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="lime"><Plus /> Recruit</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create a team recruitment post</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <select className={inp} value={form.hackathon} onChange={(e) => setForm({ ...form, hackathon: e.target.value })}>{hackathons.map((h) => <option key={h.id}>{h.name}</option>)}</select>
              <input className={inp} placeholder="Project idea" value={form.idea} onChange={(e) => setForm({ ...form, idea: e.target.value })} />
              <input className={inp} placeholder="Roles needed (comma separated)" value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} />
              <input className={inp} placeholder="Team size e.g. 2/4" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              <Button variant="lime" className="w-full" disabled={!form.idea || !form.roles} onClick={() => {
                setTeams([{ id: crypto.randomUUID(), authorId: me.id, hackathon: form.hackathon, idea: form.idea, roles: form.roles.split(",").map((r) => r.trim()).filter(Boolean), size: form.size }, ...teams]);
                setOpen(false); setForm({ ...form, idea: "", roles: "" }); toast.success("Team post published (preview only)");
              }}>Publish</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {teams.map((t) => {
          const u = getUser(t.authorId)!;
          return (
            <div key={t.id} className="surface flex flex-wrap items-center gap-4 p-4">
              <UserAvatar user={u} />
              <div className="min-w-0 flex-1">
                <p className="text-sm"><UserLink user={u} /> · <span className="text-muted-foreground">{t.hackathon}</span></p>
                <p className="font-medium">{t.idea}</p>
                <div className="mt-2 flex flex-wrap gap-1">{t.roles.map((r) => <span key={r} className="chip border-lime bg-lime-soft">{r}</span>)}<span className="chip">Team {t.size}</span></div>
              </div>
              {u.id !== me.id && <Button size="sm" onClick={() => toast.success(`Request to join sent to ${u.name}`)}>Request to join</Button>}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
