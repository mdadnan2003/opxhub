import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/opx/AppShell";
import { StudentCard } from "@/components/opx/StudentCard";
import { PageHeader, UserAvatar } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { users, me, getUser } from "@/lib/mock-data";
import { useStore, setState } from "@/lib/store";
import { seo } from "@/lib/seo";
import { useState } from "react";
import { useProfiles } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/network")({
  head: () => seo("My Network", "Manage connection requests and grow your student network."),
  component: Network,
});

function Network() {
  const connected = useStore((s) => s.connected);
  const profiles = useProfiles().data ?? [];
  const userList: Array<{
    id: string;
    name: string;
    headline: string;
    college: string;
    grad_year: number | null;
    year: number | null;
    skills: string[];
    interests: string[];
  }> = profiles.length
    ? profiles.map((p) => ({
        id: p.id,
        name: p.full_name || "Member",
        headline: p.headline || "Student builder",
        college: p.college || "Campus",
        grad_year: p.grad_year ?? null,
        year: p.grad_year ?? null,
        skills: p.skills ?? [],
        interests: p.interests ?? [],
      }))
    : users.map((u) => ({
        id: u.id,
        name: u.name,
        headline: u.headline,
        college: u.college,
        grad_year: u.year,
        year: u.year,
        skills: u.skills,
        interests: [],
      }));
  const [requests, setRequests] = useState(["priya", "sara"]);
  const respond = (id: string, accept: boolean) => {
    setRequests((r) => r.filter((x) => x !== id));
    if (accept) {
      setState((s) => ({ connected: new Set([...s.connected, id]) }));
      toast.success(`You're now connected with ${getUser(id)!.name}`);
    }
  };
  return (
    <AppShell rightRail={false}>
      <PageHeader
        title="My Network"
        subtitle={`${connected.size} connections`}
        action={
          <Button asChild variant="lime">
            <Link to="/discover">Discover students</Link>
          </Button>
        }
      />
      <div className="surface mb-4 p-4">
        <h3 className="mb-3 text-sm font-semibold">Pending requests ({requests.length})</h3>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">You're all caught up.</p>
        ) : (
          requests.map((id) => {
            const u = getUser(id)!;
            return (
              <div key={id} className="flex items-center gap-3 border-t py-3 first:border-0">
                <UserAvatar user={u} />
                <div className="flex-1">
                  <Link
                    to="/profile/$id"
                    params={{ id }}
                    className="text-sm font-semibold hover:underline"
                  >
                    {u.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {u.headline} · {u.mutual} mutual
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => respond(id, false)}>
                  Ignore
                </Button>
                <Button size="sm" variant="lime" onClick={() => respond(id, true)}>
                  Accept
                </Button>
              </div>
            );
          })
        )}
      </div>
      <h3 className="mb-3 text-sm font-semibold">Your connections</h3>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {userList
          .filter((u) => connected.has(u.id))
          .map((u) => (
            <StudentCard key={u.id} user={u} meId={me.id} connections={undefined} />
          ))}
      </div>
      <h3 className="mb-3 text-sm font-semibold">People you may know</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {userList
          .filter((u) => u.id !== me.id && !connected.has(u.id))
          .map((u) => (
            <StudentCard key={u.id} user={u} meId={me.id} connections={undefined} />
          ))}
      </div>
    </AppShell>
  );
}
