import { useState } from "react";
import { Image, Trophy, HelpCircle, Briefcase, Code2 } from "lucide-react";
import { toast } from "sonner";
import { me, type Post } from "@/lib/mock-data";
import { setState } from "@/lib/store";
import { UserAvatar } from "./primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const kinds = [
  { k: "project", label: "Project", icon: Code2 },
  { k: "achievement", label: "Achievement", icon: Trophy },
  { k: "question", label: "Question", icon: HelpCircle },
  { k: "opportunity", label: "Opportunity", icon: Briefcase },
] as const;

export function Composer() {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<Post["kind"]>();
  const [open, setOpen] = useState(false);
  const submit = () => {
    if (!text.trim()) return;
    setState((s) => ({ posts: [{ id: crypto.randomUUID(), authorId: me.id, time: "now", text: text.trim(), kind, likes: 0, reposts: 0, comments: [] }, ...s.posts] }));
    setText(""); setKind(undefined); setOpen(false);
    toast.success("Posted (preview only — not saved)");
  };
  return (
    <div className="surface p-4">
      <div className="flex gap-3">
        <UserAvatar user={me} size={44} />
        <textarea
          value={text} onFocus={() => setOpen(true)} onChange={(e) => setText(e.target.value)}
          placeholder="Share something with your network…" rows={open ? 3 : 1}
          className="flex-1 resize-none rounded-2xl border bg-muted px-4 py-2.5 text-sm outline-none transition-all focus:border-lime focus:bg-card"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        <button onClick={() => toast("Image upload needs a backend — coming soon")} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><Image className="size-4" />Media</button>
        {kinds.map((k) => (
          <button key={k.k} onClick={() => { setKind(kind === k.k ? undefined : k.k); setOpen(true); }}
            className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground", kind === k.k && "bg-lime text-lime-foreground hover:bg-lime")}>
            <k.icon className="size-4" />{k.label}
          </button>
        ))}
        {open && <Button variant="lime" className="ml-auto" disabled={!text.trim()} onClick={submit}>Post</Button>}
      </div>
    </div>
  );
}
