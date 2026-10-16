import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/opx/AppShell";
import { PageHeader } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { communities } from "@/lib/mock-data";
import { useStore, toggleIn } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/communities/")({
  head: () => seo("Communities", "Join topic communities for AI, web dev, cybersecurity, startups and more."),
  component: Communities,
});

function Communities() {
  const joined = useStore((s) => s.joined);
  return (
    <AppShell>
      <PageHeader title="Communities" subtitle="Topic spaces to learn, share and build together." />
      <div className="grid gap-4 sm:grid-cols-2">
        {communities.map((c) => (
          <div key={c.id} className="surface flex flex-col p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-ink font-display font-bold text-lime">{c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
            <Link to="/communities/$id" params={{ id: c.id }} className="mt-3 font-semibold hover:underline">{c.name}</Link>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.members.toLocaleString()} members</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant={joined.has(c.id) ? "secondary" : "lime"} onClick={() => toggleIn("joined", c.id)}>{joined.has(c.id) ? "Joined · Leave" : "Join"}</Button>
              <Button size="sm" variant="ghost" asChild><Link to="/communities/$id" params={{ id: c.id }}>Open</Link></Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
