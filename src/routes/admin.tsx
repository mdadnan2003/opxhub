import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Users, FileText, Briefcase, Trophy, Flag, Star } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Logo } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { opportunities, hackathons, communities } from "@/lib/mock-data";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () => seo("Admin dashboard", "Manage users, content, opportunities and communities on OPXHUB."),
  component: Admin,
});

const stats = [
  { l: "Total users", v: "48,210", d: "+1,204 this week", i: Users },
  { l: "Posts", v: "126,880", d: "+8.2%", i: FileText },
  { l: "Opportunities", v: opportunities.length, d: "2 verified", i: Briefcase },
  { l: "Open reports", v: 14, d: "3 urgent", i: Flag },
];
const signups = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({ d, v: [140, 180, 210, 165, 240, 120, 149][i] }));
const reports = [
  { who: "anon_user42", reason: "Spam links in comments", time: "12m" },
  { who: "hackbot", reason: "Fake internship listing", time: "1h" },
  { who: "rk_dev", reason: "Harassment in DM", time: "3h" },
];

function Admin() {
  return (
    <div className="min-h-screen">
      <header className="bg-ink text-ink-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Logo dark /><span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-lime-foreground">ADMIN</span>
          <Link to="/feed" className="ml-auto text-sm opacity-70 hover:opacity-100">Back to app</Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <p className="text-xs text-muted-foreground">Sample figures — admin permissions are not enforced in preview mode.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="surface p-5">
              <s.i className="size-5 text-muted-foreground" />
              <p className="mt-3 font-display text-2xl font-bold">{s.v}</p>
              <p className="text-sm text-muted-foreground">{s.l} · {s.d}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="surface p-5">
            <h3 className="mb-4 text-sm font-semibold">New registrations (7 days)</h3>
            <div className="h-56">
              <ResponsiveContainer><BarChart data={signups}><XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={12} /><Tooltip cursor={{ fill: "var(--muted)" }} /><Bar dataKey="v" fill="var(--lime)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
            </div>
          </div>
          <div className="surface p-5">
            <h3 className="mb-3 text-sm font-semibold">Moderation queue</h3>
            {reports.map((r) => (
              <div key={r.who} className="border-t py-3 text-sm first:border-0">
                <p><b>{r.who}</b> · <span className="text-muted-foreground">{r.time}</span></p>
                <p className="text-muted-foreground">{r.reason}</p>
                <div className="mt-2 flex gap-2"><Button size="sm" variant="outline" onClick={() => toast("Dismissed")}>Dismiss</Button><Button size="sm" variant="destructive" onClick={() => toast("User suspended")}>Suspend</Button></div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Star className="size-4" /> Opportunities · featured</h3>
            {opportunities.map((o, i) => <div key={o.id} className="flex items-center justify-between border-t py-2.5 text-sm first:border-0"><div><p className="font-medium">{o.title}</p><p className="text-xs text-muted-foreground">{o.org} · {o.verified ? "Verified" : "Unverified"}</p></div><Switch defaultChecked={i === 0} /></div>)}
          </div>
          <div className="surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Trophy className="size-4" /> Hackathons</h3>
            {hackathons.map((h) => <div key={h.id} className="flex items-center justify-between border-t py-2.5 text-sm first:border-0"><span>{h.name}</span><Button size="sm" variant="ghost">Edit</Button></div>)}
          </div>
          <div className="surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Users className="size-4" /> Communities</h3>
            {communities.map((c) => <div key={c.id} className="flex items-center justify-between border-t py-2.5 text-sm first:border-0"><span>{c.name}</span><span className="text-xs text-muted-foreground">{c.members.toLocaleString()}</span></div>)}
          </div>
        </div>
      </main>
    </div>
  );
}
