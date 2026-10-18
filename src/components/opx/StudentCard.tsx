import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { type Profile, type Connection, relation, useConnect } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./primitives";

export function ConnectButton({ meId, other, name, connections, size = "sm", className }: { meId: string; other: string; name: string; connections: Connection[] | undefined; size?: "sm" | "default"; className?: string }) {
  const connect = useConnect();
  const rel = relation(connections, meId, other);
  if (meId === other) return null;
  const go = (action: "send" | "accept" | "remove", msg: string) => connect.mutate({ me: meId, other, action }, { onSuccess: () => toast.success(msg), onError: () => toast.error("Something went wrong") });
  if (rel === "connected") return <Button size={size} className={className} variant="secondary" onClick={() => go("remove", `Removed ${name}`)}>Connected</Button>;
  if (rel === "sent") return <Button size={size} className={className} variant="outline" onClick={() => go("remove", "Request withdrawn")}>Pending · Withdraw</Button>;
  if (rel === "received") return <Button size={size} className={className} variant="lime" onClick={() => go("accept", `You're now connected with ${name}`)}>Accept</Button>;
  return <Button size={size} className={className} variant="lime" disabled={connect.isPending} onClick={() => go("send", `Request sent to ${name}`)}>Connect</Button>;
}

export function StudentCard({ user, meId, connections }: { user: Profile; meId: string; connections: Connection[] | undefined }) {
  const name = user.full_name || "Member";
  return (
    <div className="surface flex flex-col items-center p-5 text-center">
      <UserAvatar user={{ id: user.id, name }} size={64} />
      <Link to="/profile/$id" params={{ id: user.id }} className="mt-3 font-semibold hover:underline">{name}</Link>
      <p className="line-clamp-1 text-xs text-muted-foreground">{user.headline || "OPXHUB member"}</p>
      <p className="mt-1 text-xs text-muted-foreground">{[user.college, user.grad_year].filter(Boolean).join(" · ")}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-1">
        {[...user.skills, ...user.interests].slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}
      </div>
      <ConnectButton meId={meId} other={user.id} name={name} connections={connections} className="mt-4 w-full" />
    </div>
  );
}
