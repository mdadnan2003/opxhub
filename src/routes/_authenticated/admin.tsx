import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  FileText,
  Briefcase,
  Trophy,
  Flag,
  Plus,
  Pencil,
  Trash2,
  FolderGit2,
  type LucideIcon,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { BrandLogo } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useStore,
  upsertOpportunity,
  removeOpportunity,
  upsertHackathon,
  removeHackathon,
  upsertOpenSourceProject,
  removeOpenSourceProject,
} from "@/lib/store";
import type { Opportunity, Hackathon } from "@/lib/mock-data";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    const email = String(
      (context as { user?: { email?: string } } | undefined)?.user?.email ?? "",
    ).toLowerCase();
    if (email !== "mdadnaniftekhari@gmail.com") {
      throw redirect({ to: "/feed" });
    }
  },
  head: () =>
    seo("Admin dashboard", "Manage users, content, opportunities and communities on OPXHUB."),
  component: Admin,
});

type StatItem = {
  l: string;
  v: string | number;
  d: string;
  i: LucideIcon;
};

const stats: StatItem[] = [
  { l: "Total users", v: "48,210", d: "+1,204 this week", i: Users },
  { l: "Posts", v: "126,880", d: "+8.2%", i: FileText },
  { l: "Opportunities", v: 0, d: "Live listings", i: Briefcase },
  { l: "Open reports", v: 14, d: "3 urgent", i: Flag },
];
const signups = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
  d,
  v: [140, 180, 210, 165, 240, 120, 149][i],
}));
const reports = [
  { who: "anon_user42", reason: "Spam links in comments", time: "12m" },
  { who: "hackbot", reason: "Fake internship listing", time: "1h" },
  { who: "rk_dev", reason: "Harassment in DM", time: "3h" },
];

type OpportunityForm = Omit<Opportunity, "id"> & { id?: string; stipend?: string };
const emptyOpportunity: OpportunityForm = {
  id: "",
  title: "",
  org: "",
  mode: "Remote",
  type: "Internship",
  category: "Engineering",
  eligibility: "",
  deadline: "2026-12-15",
  stipend: "Paid",
  verified: true,
  link: "#",
};

type HackathonForm = Omit<Hackathon, "id"> & { id?: string };
const emptyHackathon: HackathonForm = {
  id: "",
  name: "",
  org: "",
  mode: "Online",
  deadline: "2026-12-15",
  dates: "",
  prize: "",
  location: "",
  tags: [],
};

type OpenProjectForm = {
  id?: string;
  title: string;
  description: string;
  tags: string;
  featured: boolean;
};

function Admin() {
  const opportunities = useStore((s) => s.opportunities);
  const hackathons = useStore((s) => s.hackathons);
  const openSourceProjects = useStore((s) => s.openSourceProjects);

  const [opportunityForm, setOpportunityForm] = useState<OpportunityForm>({
    ...emptyOpportunity,
    id: "",
  });
  const [hackathonForm, setHackathonForm] = useState<HackathonForm>({ ...emptyHackathon, id: "" });
  const [openSourceForm, setOpenSourceForm] = useState<OpenProjectForm>({
    title: "",
    description: "",
    tags: "",
    featured: false,
  });

  const statsWithLiveValues = useMemo<StatItem[]>(
    () => [
      stats[0]!,
      stats[1]!,
      {
        ...stats[2]!,
        v: opportunities.length,
        d: `${opportunities.filter((o) => o.verified).length} verified`,
      },
      stats[3]!,
    ],
    [opportunities],
  );

  const saveOpportunity = () => {
    const title = opportunityForm.title.trim();
    const org = opportunityForm.org.trim();
    if (!title || !org) {
      toast.error("Add a title and company before saving.");
      return;
    }

    const payload: Opportunity = {
      id: opportunityForm.id || crypto.randomUUID(),
      title,
      org,
      mode: opportunityForm.mode,
      type: opportunityForm.type,
      category: opportunityForm.category,
      eligibility: opportunityForm.eligibility,
      deadline: opportunityForm.deadline,
      ...(opportunityForm.stipend ? { stipend: opportunityForm.stipend } : {}),
      verified: opportunityForm.verified,
      link: opportunityForm.link || "#",
    };

    upsertOpportunity(payload);
    setOpportunityForm({ ...emptyOpportunity, id: "" });
    toast.success("Opportunity saved.");
  };

  const saveHackathon = () => {
    const name = hackathonForm.name.trim();
    if (!name) {
      toast.error("Hackathon name is required.");
      return;
    }

    const payload: Hackathon = {
      id: hackathonForm.id || crypto.randomUUID(),
      name,
      org: hackathonForm.org || "Community",
      mode: hackathonForm.mode,
      deadline: hackathonForm.deadline,
      dates: hackathonForm.dates || "TBA",
      ...(hackathonForm.prize ? { prize: hackathonForm.prize } : {}),
      ...(hackathonForm.location ? { location: hackathonForm.location } : {}),
      tags: hackathonForm.tags.length ? hackathonForm.tags : ["Community"],
    };

    upsertHackathon(payload);
    setHackathonForm({ ...emptyHackathon, id: "" });
    toast.success("Hackathon saved.");
  };

  const saveOpenProject = () => {
    const title = openSourceForm.title.trim();
    const description = openSourceForm.description.trim();
    if (!title || !description) {
      toast.error("Project title and description are required.");
      return;
    }

    upsertOpenSourceProject({
      id: openSourceForm.id || crypto.randomUUID(),
      title,
      description,
      tags: openSourceForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean) || ["Open Source"],
      featured: openSourceForm.featured,
    });

    setOpenSourceForm({ title: "", description: "", tags: "", featured: false });
    toast.success("Open source project saved.");
  };

  return (
    <div className="min-h-screen">
      <header className="bg-ink text-ink-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <BrandLogo className="h-8 w-auto max-w-[160px]" />
          <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-lime-foreground">
            ADMIN
          </span>
          <Link to="/feed" className="ml-auto text-sm opacity-70 hover:opacity-100">
            Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <p className="text-xs text-muted-foreground">
          Live content control panel for opportunities, hackathons, and open-source programs.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsWithLiveValues.map((s) => (
            <div key={s.l} className="surface p-5">
              <s.i className="size-5 text-muted-foreground" />
              <p className="mt-3 font-display text-2xl font-bold">{s.v}</p>
              <p className="text-sm text-muted-foreground">
                {s.l} · {s.d}
              </p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="surface p-5">
            <h3 className="mb-4 text-sm font-semibold">New registrations (7 days)</h3>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={signups}>
                  <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="v" fill="var(--lime)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="surface p-5">
            <h3 className="mb-3 text-sm font-semibold">Moderation queue</h3>
            {reports.map((r) => (
              <div key={r.who} className="border-t py-3 text-sm first:border-0">
                <p>
                  <b>{r.who}</b> · <span className="text-muted-foreground">{r.time}</span>
                </p>
                <p className="text-muted-foreground">{r.reason}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast("Dismissed")}>
                    Dismiss
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => toast("User suspended")}>
                    Suspend
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Briefcase className="size-4" /> Manage opportunities
            </h3>
            <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
              <input
                value={opportunityForm.title}
                onChange={(e) => setOpportunityForm({ ...opportunityForm, title: e.target.value })}
                placeholder="Title"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <input
                value={opportunityForm.org}
                onChange={(e) => setOpportunityForm({ ...opportunityForm, org: e.target.value })}
                placeholder="Company"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  value={opportunityForm.type}
                  onChange={(e) =>
                    setOpportunityForm({
                      ...opportunityForm,
                      type: e.target.value as "Internship" | "Job",
                    })
                  }
                  className="h-10 rounded-lg border bg-card px-3 text-sm"
                >
                  <option>Internship</option>
                  <option>Job</option>
                </select>
                <select
                  value={opportunityForm.mode}
                  onChange={(e) =>
                    setOpportunityForm({
                      ...opportunityForm,
                      mode: e.target.value as "Remote" | "Hybrid" | "On-site",
                    })
                  }
                  className="h-10 rounded-lg border bg-card px-3 text-sm"
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
              <input
                value={opportunityForm.category}
                onChange={(e) =>
                  setOpportunityForm({ ...opportunityForm, category: e.target.value })
                }
                placeholder="Category"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <input
                value={opportunityForm.eligibility}
                onChange={(e) =>
                  setOpportunityForm({ ...opportunityForm, eligibility: e.target.value })
                }
                placeholder="Eligibility"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="date"
                  value={opportunityForm.deadline}
                  onChange={(e) =>
                    setOpportunityForm({ ...opportunityForm, deadline: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
                />
                <input
                  value={opportunityForm.stipend ?? ""}
                  onChange={(e) =>
                    setOpportunityForm({ ...opportunityForm, stipend: e.target.value })
                  }
                  placeholder="Stipend"
                  className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                <span>Verified</span>
                <Switch
                  checked={opportunityForm.verified}
                  onCheckedChange={(checked: boolean) =>
                    setOpportunityForm({ ...opportunityForm, verified: checked })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="lime" onClick={saveOpportunity}>
                  <Plus className="mr-2 size-4" />
                  Save
                </Button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {opportunities.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.org} · {o.mode}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setOpportunityForm({ ...o, id: o.id, deadline: o.deadline })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        removeOpportunity(o.id);
                        toast.success("Opportunity deleted.");
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Trophy className="size-4" /> Manage hackathons
            </h3>
            <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
              <input
                value={hackathonForm.name}
                onChange={(e) => setHackathonForm({ ...hackathonForm, name: e.target.value })}
                placeholder="Hackathon name"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <input
                value={hackathonForm.org}
                onChange={(e) => setHackathonForm({ ...hackathonForm, org: e.target.value })}
                placeholder="Organizer"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  value={hackathonForm.mode}
                  onChange={(e) =>
                    setHackathonForm({
                      ...hackathonForm,
                      mode: e.target.value as "Online" | "Offline",
                    })
                  }
                  className="h-10 rounded-lg border bg-card px-3 text-sm"
                >
                  <option>Online</option>
                  <option>Offline</option>
                </select>
                <input
                  type="date"
                  value={hackathonForm.deadline}
                  onChange={(e) => setHackathonForm({ ...hackathonForm, deadline: e.target.value })}
                  className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
                />
              </div>
              <input
                value={hackathonForm.dates}
                onChange={(e) => setHackathonForm({ ...hackathonForm, dates: e.target.value })}
                placeholder="Dates"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <input
                value={hackathonForm.location ?? ""}
                onChange={(e) => setHackathonForm({ ...hackathonForm, location: e.target.value })}
                placeholder="Location"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <input
                value={hackathonForm.prize ?? ""}
                onChange={(e) => setHackathonForm({ ...hackathonForm, prize: e.target.value })}
                placeholder="Prize"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <input
                value={hackathonForm.tags.join(", ")}
                onChange={(e) =>
                  setHackathonForm({
                    ...hackathonForm,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Tags separated by comma"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <Button className="w-full" variant="lime" onClick={saveHackathon}>
                <Plus className="mr-2 size-4" />
                Save
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {hackathons.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{h.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.org} · {h.mode}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setHackathonForm({ ...h, id: h.id, tags: h.tags ?? [] })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        removeHackathon(h.id);
                        toast.success("Hackathon deleted.");
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <FolderGit2 className="size-4" /> Manage Open Source
            </h3>
            <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
              <input
                value={openSourceForm.title}
                onChange={(e) => setOpenSourceForm({ ...openSourceForm, title: e.target.value })}
                placeholder="Project title"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <textarea
                value={openSourceForm.description}
                onChange={(e) =>
                  setOpenSourceForm({ ...openSourceForm, description: e.target.value })
                }
                placeholder="Short description"
                className="min-h-24 w-full rounded-lg border bg-card px-3 py-2 text-sm"
              />
              <input
                value={openSourceForm.tags}
                onChange={(e) => setOpenSourceForm({ ...openSourceForm, tags: e.target.value })}
                placeholder="Tags, comma separated"
                className="h-10 w-full rounded-lg border bg-card px-3 text-sm"
              />
              <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                <span>Featured</span>
                <Switch
                  checked={openSourceForm.featured}
                  onCheckedChange={(checked: boolean) =>
                    setOpenSourceForm({ ...openSourceForm, featured: checked })
                  }
                />
              </div>
              <Button className="w-full" variant="lime" onClick={saveOpenProject}>
                <Plus className="mr-2 size-4" />
                Save
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {openSourceProjects.map((p) => (
                <div key={p.id} className="rounded-lg border p-2.5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{p.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          setOpenSourceForm({
                            id: p.id,
                            title: p.title,
                            description: p.description,
                            tags: p.tags.join(", "),
                            featured: !!p.featured,
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                          removeOpenSourceProject(p.id);
                          toast.success("Open source project deleted.");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
