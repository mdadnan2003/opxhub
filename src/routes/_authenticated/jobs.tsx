import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, Share2, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/opx/AppShell";
import { PageHeader } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { daysLeft, me } from "@/lib/mock-data";
import { useStore, toggleIn, setState } from "@/lib/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () =>
    seo(
      "Jobs & Internships",
      "Internships and entry-level roles for students, with deadlines and eligibility.",
    ),
  component: Jobs,
});

const cats = ["All", "Engineering", "AI/ML", "Design", "Data", "Security"];

function Jobs() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [mode, setMode] = useState("Any");
  const opportunities = useStore((s) => s.opportunities);
  const saved = useStore((s) => s.savedOpps);
  const list = opportunities
    .filter(
      (o) =>
        (cat === "All" || o.category === cat) &&
        (mode === "Any" || o.mode === mode) &&
        `${o.title} ${o.org}`.toLowerCase().includes(q.toLowerCase()),
    )
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  return (
    <AppShell>
      <PageHeader title="Jobs & Internships" subtitle="Sorted by closest deadline." />
      <div className="surface mb-4 space-y-3 p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Role or company"
              className="h-10 w-full rounded-full border bg-muted pl-9 pr-4 text-sm outline-none focus:border-lime"
            />
          </div>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="h-10 rounded-full border bg-card px-3 text-sm"
          >
            {["Any", "Remote", "Hybrid", "On-site"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                cat === c && "border-lime bg-lime text-lime-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className="surface flex flex-wrap gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-xl bg-ink font-display text-lg font-bold text-lime">
              {o.org[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{o.title}</p>
              <p className="text-sm text-muted-foreground">
                {o.org} · {o.type}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="chip">{o.mode}</span>
                {o.stipend && o.verified && <span className="chip">{o.stipend}</span>}
                <span
                  className={cn("chip", daysLeft(o.deadline) <= 14 && "border-lime bg-lime-soft")}
                >
                  Closes in {daysLeft(o.deadline)}d
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Eligibility: {o.eligibility}</p>
              <p className="mt-1 flex items-center gap-1 text-xs">
                {o.verified ? (
                  <>
                    <CheckCircle2 className="size-3.5" /> Details confirmed from official source
                  </>
                ) : (
                  <>
                    <AlertCircle className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Community-shared · not yet verified
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Button
                size="icon"
                variant={saved.has(o.id) ? "lime" : "outline"}
                aria-label="Save"
                onClick={() => toggleIn("savedOpps", o.id)}
              >
                <Bookmark />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Share to feed"
                onClick={() => {
                  setState((s) => ({
                    posts: [
                      {
                        id: crypto.randomUUID(),
                        authorId: me.id,
                        time: "now",
                        kind: "opportunity",
                        text: `Sharing this opportunity with my network 👇`,
                        opportunity: {
                          title: o.title,
                          org: o.org,
                          mode: o.mode,
                          deadline: o.deadline,
                        },
                        likes: 0,
                        reposts: 0,
                        comments: [],
                      },
                      ...s.posts,
                    ],
                  }));
                  toast.success("Shared to your feed");
                }}
              >
                <Share2 />
              </Button>
              <Button onClick={() => toast("Official application links will be added by admins")}>
                Apply
              </Button>
            </div>
          </div>
        ))}
        {!list.length && (
          <div className="surface p-10 text-center text-sm text-muted-foreground">
            No opportunities match your filters.
          </div>
        )}
      </div>
    </AppShell>
  );
}
