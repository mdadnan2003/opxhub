import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { User } from "@/lib/mock-data";
import { useStore, toggleIn } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./primitives";

export function StudentCard({ user }: { user: User }) {
  const connected = useStore((s) => s.connected.has(user.id));
  const pending = useStore((s) => s.pending.has(user.id));
  return (
    <div className="surface flex flex-col items-center p-5 text-center">
      <UserAvatar user={user} size={64} />
      <Link to="/profile/$id" params={{ id: user.id }} className="mt-3 font-semibold hover:underline">{user.name}</Link>
      <p className="line-clamp-1 text-xs text-muted-foreground">{user.headline}</p>
      <p className="mt-1 text-xs text-muted-foreground">{user.college} · {user.year}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-1">
        {user.skills.slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}
      </div>
      {user.available && <span className="mt-2 text-[11px] font-semibold">● Open to hackathon teams</span>}
      {user.mutual ? <p className="mt-2 text-[11px] text-muted-foreground">{user.mutual} mutual connections</p> : null}
      <Button className="mt-4 w-full" size="sm" variant={connected ? "secondary" : pending ? "outline" : "lime"} disabled={connected}
        onClick={() => { toggleIn("pending", user.id); if (!pending) toast.success(`Request sent to ${user.name}`); }}>
        {connected ? "Connected" : pending ? "Pending · Withdraw" : "Connect"}
      </Button>
    </div>
  );
}
