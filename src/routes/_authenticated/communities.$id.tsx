import { createFileRoute, notFound } from "@tanstack/react-router";
import { Pin } from "lucide-react";
import { AppShell } from "@/components/opx/AppShell";
import { Composer } from "@/components/opx/Composer";
import { PostCard } from "@/components/opx/PostCard";
import { Button } from "@/components/ui/button";
import { communities } from "@/lib/mock-data";
import { useStore, toggleIn } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/communities/$id")({
  loader: ({ params }) => {
    const c = communities.find((x) => x.id === params.id);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Community"} · OPXHUB` },
      { name: "description", content: loaderData?.desc ?? "OPXHUB community" },
      { property: "og:title", content: `${loaderData?.name ?? "Community"} · OPXHUB` },
      { property: "og:description", content: loaderData?.desc ?? "OPXHUB community" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Community,
});

function Community() {
  const c = Route.useLoaderData();
  const joined = useStore((s) => s.joined.has(c.id));
  const posts = useStore((s) => s.posts).slice(0, 3);
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl bg-ink p-6 text-ink-foreground">
          <h1 className="text-2xl font-bold">{c.name}</h1>
          <p className="mt-1 text-sm opacity-70">
            {c.desc} · {c.members.toLocaleString()} members
          </p>
          <Button
            className="mt-4"
            variant={joined ? "outline" : "lime"}
            onClick={() => toggleIn("joined", c.id)}
          >
            {joined ? "Leave community" : "Join community"}
          </Button>
        </div>
        <div className="surface flex items-center gap-3 border-l-4 border-l-lime p-4 text-sm">
          <Pin className="size-4" />
          <b>Pinned:</b> {c.pinned}
        </div>
        {joined ? (
          <Composer />
        ) : (
          <div className="surface p-4 text-sm text-muted-foreground">
            Join to post in this community.
          </div>
        )}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </AppShell>
  );
}
