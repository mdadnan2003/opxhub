import * as React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { MapPin, GraduationCap, Github, Globe, Trophy, Award, Mail } from "lucide-react";
import { AppShell } from "@/components/opx/AppShell";
import { PostCard } from "@/components/opx/PostCard";
import { UserAvatar } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMe, usePosts, useProfile } from "@/lib/api";
import cover from "@/assets/cover.jpg";

type ProfileViewUser = {
  id: string;
  name: string;
  headline: string;
  college: string;
  degree: string;
  year: number;
  location?: string | undefined;
  skills: string[];
  interests: string[];
  connections: number;
  available?: boolean | undefined;
  mutual?: number | undefined;
  about?: string | undefined;
};

function normalizeProfileUser(raw: Record<string, unknown> | null | undefined): ProfileViewUser {
  const profile = (raw ?? {}) as Record<string, unknown>;
  const skillList = Array.isArray(profile["skills"]) ? (profile["skills"] as unknown[]) : [];
  const interestList = Array.isArray(profile["interests"])
    ? (profile["interests"] as unknown[])
    : [];

  return {
    id: String(profile["id"] ?? "unknown"),
    name: String(profile["full_name"] ?? profile["name"] ?? "Member"),
    headline: String(profile["headline"] ?? "Student builder"),
    college: String(profile["college"] ?? "Campus"),
    degree: String(profile["course"] ?? profile["degree"] ?? "Student"),
    year: Number(profile["grad_year"] ?? profile["year"] ?? 2027),
    location: typeof profile["location"] === "string" ? profile["location"] : undefined,
    skills: skillList.map((item) => String(item)),
    interests: interestList.map((item) => String(item)),
    connections: Number(profile["connections"] ?? 0),
    available: typeof profile["available"] === "boolean" ? profile["available"] : true,
    mutual: typeof profile["mutual"] === "number" ? profile["mutual"] : 0,
    about:
      typeof profile["about"] === "string"
        ? profile["about"]
        : "Student builder exploring new ideas and building in public.",
  };
}

export const Route = createFileRoute("/_authenticated/profile/$id")({
  head: () => ({
    meta: [
      { title: "Profile · OPXHUB" },
      { name: "description", content: "Student profile on OPXHUB" },
      { property: "og:title", content: "Profile · OPXHUB" },
      { property: "og:description", content: "Student profile on OPXHUB" },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { id: profileId } = useParams({ from: "/_authenticated/profile/$id" });
  const { id: meId } = useMe();
  const { data: profileRecord, isLoading } = useProfile(profileId);
  const { data: userPosts = [] } = usePosts({ authorId: profileId });
  const profile = profileRecord ? normalizeProfileUser(profileRecord) : null;
  const isMe = meId === profileId;

  if (isLoading) {
    return (
      <AppShell>
        <div className="surface p-10 text-center text-sm text-muted-foreground">
          Loading profile…
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="surface p-10 text-center text-sm text-muted-foreground">
          This profile is not available yet.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="surface overflow-hidden">
          <img
            src={cover}
            alt=""
            width={1600}
            height={544}
            className="h-36 w-full object-cover md:h-44"
          />
          <div className="px-5 pb-5">
            <div className="-mt-12 flex items-end justify-between">
              <UserAvatar user={profile} size={104} ring />
              <div className="flex gap-2">
                {!isMe && (
                  <Button variant="outline" asChild>
                    <Link to="/messages">
                      <Mail /> Message
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <h1 className="mt-3 text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm">{profile.headline}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <GraduationCap className="size-4" />
                {profile.college} · {profile.degree} · {profile.year}
              </span>
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {profile.location}
                </span>
              )}
              <span className="font-semibold text-foreground">
                {profile.connections} connections
              </span>
            </div>
          </div>
        </div>
        {isMe && (
          <div className="surface p-5">
            <div className="mb-2 flex justify-between text-sm">
              <b>Profile strength</b>
              <span>
                {Math.min(100, 55 + (profile.skills.length + profile.interests.length) * 5)}%
              </span>
            </div>
            <Progress
              value={Math.min(100, 55 + (profile.skills.length + profile.interests.length) * 5)}
              className="[&>div]:bg-lime"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Add your project links, interests, and bio to keep your profile complete.
            </p>
          </div>
        )}
        <Section title="About">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {profile.about || "No bio added yet."}
          </p>
        </Section>
        <Section title="Interests">
          {profile.interests && profile.interests.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No interests added yet.</p>
          )}
        </Section>
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {profile.skills.length ? (
              profile.skills.map((s: string) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            )}
          </div>
        </Section>
        <Section title="Projects">
          {userPosts.filter((post) => post.kind === "project").length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {userPosts
                .filter((post) => post.kind === "project")
                .slice(0, 4)
                .map((post) => (
                  <div key={post.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-semibold">{post.body.slice(0, 80) || "Project"}</p>
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                      <Github className="size-4" />
                      <Globe className="size-4" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isMe ? "You have not shared any projects yet." : "No projects shared yet."}
            </p>
          )}
        </Section>
        <Section title="Achievements & hackathons">
          {userPosts.filter((post) => post.kind === "achievement").length ? (
            <ul className="space-y-2 text-sm">
              {userPosts
                .filter((post) => post.kind === "achievement")
                .slice(0, 3)
                .map((post) => (
                  <li key={post.id} className="flex items-center gap-2">
                    <Trophy className="size-4" /> {post.body.slice(0, 120)}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isMe ? "No achievements have been added yet." : "No achievements to show yet."}
            </p>
          )}
        </Section>
        <h3 className="px-1 text-sm font-semibold">Activity</h3>
        {userPosts.length ? (
          userPosts.map((p) => (
            <PostCard key={p.id} post={p} meId={meId ?? undefined} saved={false} />
          ))
        ) : (
          <div className="surface p-6 text-center text-sm text-muted-foreground">
            {isMe ? "You have not created any posts yet." : "No posts yet."}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface p-5">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}
