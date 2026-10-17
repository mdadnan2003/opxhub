import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/opx/AppShell";
import { PostCard } from "@/components/opx/PostCard";
import { PageHeader } from "@/components/opx/primitives";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => seo("Saved Posts", "Posts you've bookmarked to revisit later."),
  component: Saved,
});

function Saved() {
  const posts = useStore((s) => s.posts.filter((p) => s.saved.has(p.id)));
  return (
    <AppShell>
      <PageHeader title="Saved Posts" subtitle={`${posts.length} saved`} />
      <div className="space-y-4">
        {posts.length ? posts.map((p) => <PostCard key={p.id} post={p} />) : <div className="surface p-10 text-center text-sm text-muted-foreground">Nothing saved yet. Tap the bookmark on any post.</div>}
      </div>
    </AppShell>
  );
}
