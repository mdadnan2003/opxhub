import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, BookmarkX } from "lucide-react";
import { AppShell } from "@/components/opx/AppShell";
import { PostCard } from "@/components/opx/PostCard";
import { PageHeader } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMe, useSavedPosts } from "@/lib/api";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const tabs = [
  "All Saved",
  "Projects",
  "Hackathons",
  "Jobs & Internships",
  "Opportunities",
  "Questions",
  "Achievements",
  "Other Posts",
] as const;

type Category = (typeof tabs)[number];

const toCategory = (kind: string | null | undefined, body: string): Category => {
  const text = body.toLowerCase();
  if (kind === "project") return "Projects";
  if (kind === "achievement") return "Achievements";
  if (kind === "question") return "Questions";
  if (kind === "opportunity") {
    if (text.includes("hackathon")) return "Hackathons";
    if (text.includes("intern") || text.includes("job") || text.includes("role")) {
      return "Jobs & Internships";
    }
    return "Opportunities";
  }
  if (text.includes("hackathon")) return "Hackathons";
  if (text.includes("intern") || text.includes("job") || text.includes("role")) {
    return "Jobs & Internships";
  }
  return "Other Posts";
};

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => seo("Saved Posts", "Posts you've bookmarked to revisit later."),
  component: Saved,
});

function Saved() {
  const { id: meId } = useMe();
  const { data: savedPosts = [], isLoading } = useSavedPosts(meId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All Saved");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = savedPosts
    .filter((post) => {
      const haystack = [post.body, post.author.full_name, post.author.headline, post.author.college]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesCategory =
        category === "All Saved" || toCategory(post.kind, post.body) === category;
      return matchesQuery && matchesCategory;
    })
    .sort((a, b) => {
      const delta = new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
      return sort === "newest" ? -delta : delta;
    });

  return (
    <AppShell>
      <PageHeader
        title="Saved Posts"
        subtitle="Your collection of useful ideas, projects, and opportunities."
        action={
          <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            {savedPosts.length} saved
          </div>
        }
      />

      <div className="space-y-4">
        <div className="surface p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search saved posts, people, or keywords"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5 text-sm text-muted-foreground">
                <SlidersHorizontal className="size-4" />
                <span className="hidden sm:inline">Filter</span>
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
                className="h-10 rounded-full border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-lime"
              >
                <option value="newest">Most recently saved</option>
                <option value="oldest">Oldest saved</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCategory(tab)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                  category === tab
                    ? "border-lime bg-lime text-lime-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="surface p-10 text-sm text-muted-foreground">
            Loading your saved posts…
          </div>
        ) : !savedPosts.length ? (
          <div className="surface p-10 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-lime-soft text-lime">
              <BookmarkX className="size-6" />
            </div>
            <h2 className="text-xl font-semibold">Nothing saved yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Save projects, opportunities, and posts that you want to revisit later.
            </p>
            <Button asChild className="mt-4" variant="lime">
              <Link to="/feed">Explore Posts</Link>
            </Button>
          </div>
        ) : !filtered.length ? (
          <div className="surface p-10 text-center text-sm text-muted-foreground">
            No saved posts match your search or current filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                meId={meId ?? undefined}
                saved={true}
                connections={[]}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
