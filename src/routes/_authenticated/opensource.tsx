import { createFileRoute } from "@tanstack/react-router";
import { Github, ArrowUpRight, Users, Sparkles } from "lucide-react";
import { AppShell } from "@/components/opx/AppShell";
import { PageHeader } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/opensource")({
  head: () =>
    seo("Open Source", "Discover student-built projects and contribute to real community work."),
  component: OpenSource,
});

function OpenSource() {
  const openSourceIdeas = useStore((s) => s.openSourceProjects);

  return (
    <AppShell rightRail={false}>
      <PageHeader
        title="Open Source"
        subtitle="Discover student projects, contribute to real community builds, and grow your portfolio."
        action={
          <Button variant="lime" size="sm">
            <Github className="mr-2 size-4" />
            Start a project
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="surface p-4">
          <div className="mb-2 flex items-center gap-2 text-lime">
            <Sparkles className="size-4" />
            <span className="text-sm font-semibold">Live ideas</span>
          </div>
          <p className="text-2xl font-bold">24</p>
          <p className="mt-1 text-sm text-muted-foreground">
            student-led projects looking for contributors.
          </p>
        </div>
        <div className="surface p-4">
          <div className="mb-2 flex items-center gap-2 text-lime">
            <Users className="size-4" />
            <span className="text-sm font-semibold">Active builders</span>
          </div>
          <p className="text-2xl font-bold">1.3k</p>
          <p className="mt-1 text-sm text-muted-foreground">
            contributors collaborating across colleges and domains.
          </p>
        </div>
        <div className="surface p-4">
          <div className="mb-2 flex items-center gap-2 text-lime">
            <ArrowUpRight className="size-4" />
            <span className="text-sm font-semibold">Merged PRs</span>
          </div>
          <p className="text-2xl font-bold">318</p>
          <p className="mt-1 text-sm text-muted-foreground">
            community contributions shipped this month.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {openSourceIdeas.map((item) => (
          <div key={item.title} className="surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Button variant="outline" size="sm">
                Contribute
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="chip border-lime bg-lime-soft text-lime-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
