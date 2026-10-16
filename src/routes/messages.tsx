import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { AppShell } from "@/components/opx/AppShell";
import { UserAvatar } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { conversations as seed, getUser } from "@/lib/mock-data";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: () => seo("Messages", "Chat with your connections and hackathon teammates."),
  component: Messages,
});

function Messages() {
  const [convos, setConvos] = useState(seed);
  const [activeId, setActiveId] = useState(seed[0].id);
  const [text, setText] = useState("");
  const active = convos.find((c) => c.id === activeId)!;
  const other = getUser(active.userId)!;
  const send = () => {
    if (!text.trim()) return;
    setConvos(convos.map((c) => c.id === activeId ? { ...c, messages: [...c.messages, { from: "me", text: text.trim() }] } : c));
    setText("");
  };
  return (
    <AppShell rightRail={false}>
      <div className="surface grid h-[calc(100vh-9rem)] overflow-hidden md:grid-cols-[300px_1fr]">
        <div className="hidden overflow-y-auto border-r md:block">
          <p className="border-b p-4 font-semibold">Messages</p>
          {convos.map((c) => {
            const u = getUser(c.userId)!;
            return (
              <button key={c.id} onClick={() => { setActiveId(c.id); setConvos(convos.map((x) => x.id === c.id ? { ...x, unread: 0 } : x)); }}
                className={cn("flex w-full items-center gap-3 border-b p-3 text-left hover:bg-muted", c.id === activeId && "bg-lime-soft/50")}>
                <UserAvatar user={u} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.messages.at(-1)?.text}</p>
                </div>
                {c.unread > 0 && <span className="grid size-5 place-items-center rounded-full bg-lime text-[10px] font-bold text-lime-foreground">{c.unread}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 border-b p-4">
            <UserAvatar user={other} size={36} />
            <div><Link to="/profile/$id" params={{ id: other.id }} className="text-sm font-semibold hover:underline">{other.name}</Link><p className="text-xs text-muted-foreground">{other.headline}</p></div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-background p-4">
            {active.messages.map((m, i) => (
              <div key={i} className={cn("max-w-[75%] rounded-2xl px-4 py-2 text-sm", m.from === "me" ? "ml-auto bg-ink text-ink-foreground" : "bg-card border")}>{m.text}</div>
            ))}
          </div>
          <div className="flex gap-2 border-t p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Write a message…" className="h-10 flex-1 rounded-full border bg-muted px-4 text-sm outline-none focus:border-lime" />
            <Button size="icon" variant="lime" onClick={send} aria-label="Send"><Send /></Button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Sample conversations — messages aren't delivered yet.</p>
    </AppShell>
  );
}
