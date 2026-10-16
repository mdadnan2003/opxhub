import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, GraduationCap, Github, Globe, Trophy, Award, Pencil, Mail } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/opx/AppShell";
import { PostCard } from "@/components/opx/PostCard";
import { UserAvatar } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getUser, me } from "@/lib/mock-data";
import { useStore, toggleIn } from "@/lib/store";
import cover from "@/assets/cover.jpg";

export const Route = createFileRoute("/profile/$id")({
  loader: ({ params }) => {
    const u = getUser(params.id);
    if (!u) throw notFound();
    return u;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Profile"} · OPXHUB` },
      { name: "description", content: loaderData?.headline ?? "Student profile on OPXHUB" },
      { property: "og:title", content: `${loaderData?.name ?? "Profile"} · OPXHUB` },
      { property: "og:description", content: loaderData?.headline ?? "Student profile on OPXHUB" },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const u = Route.useLoaderData();
  const isMe = u.id === me.id;
  const connected = useStore((s) => s.connected.has(u.id));
  const pending = useStore((s) => s.pending.has(u.id));
  const posts = useStore((s) => s.posts.filter((p) => p.authorId === u.id));
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="surface overflow-hidden">
          <img src={cover} alt="" width={1600} height={544} className="h-36 w-full object-cover md:h-44" />
          <div className="px-5 pb-5">
            <div className="-mt-12 flex items-end justify-between">
              <UserAvatar user={u} size={104} ring />
              <div className="flex gap-2">
                {isMe ? <Button variant="outline" onClick={() => toast("Profile editing needs a backend — coming soon")}><Pencil /> Edit profile</Button> : <>
                  {connected && <Button variant="outline" asChild><Link to="/messages"><Mail /> Message</Link></Button>}
                  <Button variant={connected ? "secondary" : "lime"} disabled={connected} onClick={() => toggleIn("pending", u.id)}>{connected ? "Connected" : pending ? "Pending" : "Connect"}</Button>
                </>}
              </div>
            </div>
            <h1 className="mt-3 text-2xl font-bold">{u.name}</h1>
            <p className="text-sm">{u.headline}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><GraduationCap className="size-4" />{u.college} · {u.degree} · {u.year}</span>
              {u.location && <span className="flex items-center gap-1"><MapPin className="size-4" />{u.location}</span>}
              <span className="font-semibold text-foreground">{u.connections} connections</span>
            </div>
          </div>
        </div>
        {isMe && (
          <div className="surface p-5">
            <div className="mb-2 flex justify-between text-sm"><b>Profile strength</b><span>72%</span></div>
            <Progress value={72} className="[&>div]:bg-lime" />
            <p className="mt-2 text-xs text-muted-foreground">Add a certification and a portfolio link to reach All-Star.</p>
          </div>
        )}
        <Section title="About"><p className="text-sm leading-relaxed text-muted-foreground">Student builder who loves shipping side projects and teaming up at hackathons. Currently exploring {u.skills.slice(0, 2).join(" and ")}.</p></Section>
        <Section title="Skills"><div className="flex flex-wrap gap-2">{u.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div></Section>
        <Section title="Projects">
          <div className="grid gap-3 sm:grid-cols-2">
            {["TeamUp — task board for clubs", "Campus Eats — canteen preorder app"].map((p) => (
              <div key={p} className="rounded-lg border p-3 text-sm"><p className="font-semibold">{p}</p><div className="mt-2 flex gap-3 text-muted-foreground"><Github className="size-4" /><Globe className="size-4" /></div></div>
            ))}
          </div>
        </Section>
        <Section title="Achievements & hackathons">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Trophy className="size-4" /> Finalist — HackBLR 2025</li>
            <li className="flex items-center gap-2"><Trophy className="size-4" /> Participant — Smart India Hackathon 2025</li>
            <li className="flex items-center gap-2"><Award className="size-4" /> Certificate — Cloud Fundamentals</li>
          </ul>
        </Section>
        <h3 className="px-1 text-sm font-semibold">Activity</h3>
        {posts.length ? posts.map((p) => <PostCard key={p.id} post={p} />) : <div className="surface p-6 text-center text-sm text-muted-foreground">No posts yet.</div>}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="surface p-5"><h3 className="mb-3 text-sm font-semibold">{title}</h3>{children}</div>;
}
