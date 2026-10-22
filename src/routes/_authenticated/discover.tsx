import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/opx/AppShell";
import { StudentCard } from "@/components/opx/StudentCard";
import { PageHeader } from "@/components/opx/primitives";
import { users, me } from "@/lib/mock-data";
import { useProfiles } from "@/lib/api";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/discover")({
  head: () =>
    seo(
      "Discover Students",
      "Search students by name, college, skill or interest and find hackathon teammates.",
    ),
  component: Discover,
});

function Discover() {
  const [q, setQ] = useState("");
  const [college, setCollege] = useState("All");
  const [year, setYear] = useState("All");
  const [available, setAvailable] = useState(false);
  const profiles = useProfiles().data ?? [];
  const data = profiles.length
    ? profiles.map((p) => ({
        id: p.id,
        name: p.full_name || "Member",
        headline: p.headline || "Student builder",
        college: p.college || "Campus",
        degree: p.course || "Student",
        year: p.grad_year ?? 2027,
        skills: p.skills ?? [],
        available: true,
      }))
    : users;
  const colleges = ["All", ...new Set(data.map((u) => u.college))];
  const years = ["All", ...new Set(data.map((u) => String(u.year)))].sort();
  const list = data.filter(
    (u) =>
      u.id !== me.id &&
      (college === "All" || u.college === college) &&
      (year === "All" || String(u.year) === year) &&
      (!available || u.available) &&
      `${u.name} ${u.college} ${u.skills.join(" ")} ${u.headline}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const sel = "h-10 rounded-full border bg-card px-3 text-sm outline-none focus:border-lime";
  return (
    <AppShell rightRail={false}>
      <PageHeader
        title="Discover Students"
        subtitle="Find builders by skill, college or availability."
      />
      <div className="surface mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, college, skill…"
            className="h-10 w-full rounded-full border bg-muted pl-9 pr-4 text-sm outline-none focus:border-lime"
          />
        </div>
        <select className={sel} value={college} onChange={(e) => setCollege(e.target.value)}>
          {colleges.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className={sel} value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() => setAvailable(!available)}
          className={cn(
            "h-10 rounded-full border px-4 text-sm font-medium",
            available && "border-lime bg-lime text-lime-foreground",
          )}
        >
          Open to teams
        </button>
      </div>
      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((u) => (
            <StudentCard key={u.id} user={u} meId={me.id} connections={undefined} />
          ))}
        </div>
      ) : (
        <div className="surface p-10 text-center text-sm text-muted-foreground">
          No students match those filters.
        </div>
      )}
    </AppShell>
  );
}
