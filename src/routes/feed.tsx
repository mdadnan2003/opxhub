import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/opx/AppShell";
import { Composer } from "@/components/opx/Composer";
import { PostCard } from "@/components/opx/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feed")({
  head: () => seo("Home feed", "See what students in your network are building, winning and sharing."),
  component: Feed,
});

const tabs = ["For You", "Following", "Trending"] as const;

function Feed() {
  const posts = useStore((s) => s.posts);
  const connected = useStore((s) => s.connected);
  const [tab, setTab] = useState<(typeof tabs)[number]>("For You");
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const list = tab === "Following" ? posts.filter((p) => connected.has(p.authorId) || p.authorId === "aarav")
    : tab === "Trending" ? [...posts].sort((a, b) => b.likes - a.likes) : posts;

  return (
    <AppShell>
      <div className="space-y-4">
        <Composer />
        <div className="flex gap-1 rounded-full border bg-card p-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-full py-2 text-sm font-semibold transition-colors", tab === t ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground")}>{t}</button>
          ))}
        </div>
        {loading ? [0, 1].map((i) => (
          <div key={i} className="surface space-y-3 p-4">
            <div className="flex gap-3"><Skeleton className="size-11 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-3 w-1/2" /></div></div>
            <Skeleton className="h-20 w-full" />
          </div>
        )) : list.length ? list.map((p) => <PostCard key={p.id} post={p} />) : (
          <div className="surface p-10 text-center text-sm text-muted-foreground">No posts from people you follow yet. Connect with more students to fill this tab.</div>
        )}
      </div>
    </AppShell>
  );
}
