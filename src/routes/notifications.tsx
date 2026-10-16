import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/opx/AppShell";
import { PageHeader, UserAvatar } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { notifications, getUser } from "@/lib/mock-data";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => seo("Notifications", "Connection requests, likes, comments, mentions and opportunity updates."),
  component: Notifications,
});

function Notifications() {
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState("All");
  const shown = items.filter((n) => filter === "All" || (filter === "Unread" ? n.unread : ["hackathon", "opportunity"].includes(n.type)));
  return (
    <AppShell>
      <PageHeader title="Notifications" action={<Button variant="outline" size="sm" onClick={() => setItems(items.map((n) => ({ ...n, unread: false })))}>Mark all read</Button>} />
      <div className="mb-3 flex gap-2">{["All", "Unread", "Opportunities"].map((f) => <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full border bg-card px-4 py-1.5 text-sm font-medium", filter === f && "border-lime bg-lime text-lime-foreground")}>{f}</button>)}</div>
      <div className="surface divide-y">
        {shown.map((n) => {
          const u = getUser(n.userId)!;
          return (
            <div key={n.id} className={cn("flex items-center gap-3 p-4", n.unread && "bg-lime-soft/40")}>
              {n.unread && <span className="size-2 rounded-full bg-lime" />}
              <UserAvatar user={u} size={40} />
              <p className="flex-1 text-sm"><b>{u.name}</b> {n.text}</p>
              {n.type === "connect" && <Button size="sm" variant="lime">Accept</Button>}
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </div>
          );
        })}
        {!shown.length && <p className="p-8 text-center text-sm text-muted-foreground">No notifications here.</p>}
      </div>
    </AppShell>
  );
}
