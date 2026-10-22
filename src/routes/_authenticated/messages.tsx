import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MoreVertical, Send, Users } from "lucide-react";
import { AppShell } from "@/components/opx/AppShell";
import { UserAvatar } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/mock-data";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { setState, useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => seo("Messages", "Chat with your connections and hackathon teammates."),
  component: Messages,
});

function Messages() {
  const convos = useStore((s) => s.conversations);
  const [activeId, setActiveId] = useState(convos[0]?.id ?? "");
  const [text, setText] = useState("");
  const active = convos.find((c) => c.id === activeId) ?? convos[0];

  const activeMembers = useMemo(
    () =>
      (active?.members ?? []).map((memberId) => getUser(memberId)).filter(Boolean) as ReturnType<
        typeof getUser
      >[],
    [active],
  );

  const send = () => {
    const value = text.trim();
    if (!value || !active) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setState((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === active.id
          ? {
              ...c,
              unread: 0,
              messages: [
                ...c.messages,
                { id: `${c.id}-${Date.now()}`, from: "me", text: value, time: currentTime },
              ],
            }
          : c,
      ),
    }));
    setText("");
  };

  if (!active) {
    return (
      <AppShell rightRail={false}>
        <div className="surface p-8 text-sm text-muted-foreground">No conversations yet.</div>
      </AppShell>
    );
  }

  const headerUser = active.kind === "direct" && active.userId ? getUser(active.userId) : null;

  return (
    <AppShell rightRail={false}>
      <div className="surface grid h-[calc(100vh-9rem)] overflow-hidden md:grid-cols-[320px_1fr]">
        <div className="hidden overflow-y-auto border-r md:block">
          <div className="flex items-center justify-between border-b p-4">
            <p className="font-semibold">Messages</p>
            <button className="rounded-full p-2 hover:bg-muted">
              <MoreVertical className="size-4" />
            </button>
          </div>
          {convos.map((c) => {
            const user = c.kind === "direct" && c.userId ? getUser(c.userId) : null;
            const label = c.kind === "group" ? c.name : (user?.name ?? c.name);
            const subtitle = c.messages.at(-1)?.text ?? "Start a conversation";
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveId(c.id);
                  setState((s) => ({
                    conversations: s.conversations.map((x) =>
                      x.id === c.id ? { ...x, unread: 0 } : x,
                    ),
                  }));
                }}
                className={cn(
                  "flex w-full items-center gap-3 border-b p-3 text-left hover:bg-muted",
                  c.id === active.id && "bg-lime-soft/50",
                )}
              >
                {c.kind === "group" ? (
                  <div className="grid size-10 place-items-center rounded-full bg-ink text-ink-foreground">
                    <Users className="size-4" />
                  </div>
                ) : (
                  <UserAvatar user={user ?? { id: "team", name: label }} size={40} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                </div>
                {c.unread > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-lime text-[10px] font-bold text-lime-foreground">
                    {c.unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              {active.kind === "group" ? (
                <div className="grid size-10 place-items-center rounded-full bg-ink text-ink-foreground">
                  <Users className="size-4" />
                </div>
              ) : (
                headerUser && <UserAvatar user={headerUser} size={36} />
              )}
              <div>
                {active.kind === "group" ? (
                  <>
                    <p className="text-sm font-semibold">{active.name}</p>
                    <p className="text-xs text-muted-foreground">{activeMembers.length} members</p>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile/$id"
                      params={{ id: headerUser!.id }}
                      className="text-sm font-semibold hover:underline"
                    >
                      {headerUser!.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{headerUser!.headline}</p>
                  </>
                )}
              </div>
            </div>
            {active.kind === "group" && (
              <Button size="sm" variant="outline">
                Members
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-background p-4">
            {active.messages.map((m) => {
              const isMe = m.from === "me";
              const user = m.from === "system" ? null : (getUser(m.from) ?? null);
              return (
                <div key={m.id} className={cn("flex gap-2", isMe && "justify-end")}>
                  {!isMe && user && <UserAvatar user={user} size={28} />}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                      isMe
                        ? "bg-ink text-ink-foreground"
                        : m.from === "system"
                          ? "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200"
                          : "bg-card border",
                    )}
                  >
                    {!isMe && user && (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {user.name}
                      </p>
                    )}
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.time && (
                      <p
                        className={cn(
                          "mt-1 text-[10px] opacity-70",
                          isMe ? "text-ink-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {m.time}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 border-t p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={
                active.kind === "group" ? "Message the project group…" : "Write a message…"
              }
              className="h-10 flex-1 rounded-full border bg-muted px-4 text-sm outline-none focus:border-lime"
            />
            <Button size="icon" variant="lime" onClick={send} aria-label="Send">
              <Send />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
