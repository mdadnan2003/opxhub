import { useState } from "react";
import { Trophy, HelpCircle, Briefcase, Code2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { type PostKind, useInvalidate } from "@/lib/api";
import { UserAvatar } from "./primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const kinds = [
  { k: "project", label: "Project", icon: Code2 },
  { k: "achievement", label: "Achievement", icon: Trophy },
  { k: "question", label: "Question", icon: HelpCircle },
  { k: "team", label: "Find team", icon: Users },
  { k: "opportunity", label: "Opportunity", icon: Briefcase },
] as const;

export function Composer({ meId, meName }: { meId: string; meName: string }) {
  const inv = useInvalidate();
  const [text, setText] = useState("");
  const [kind, setKind] = useState<PostKind | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    const { error } = await supabase.from("posts").insert({ author_id: meId, body, kind });
    setBusy(false);
    if (error) return toast.error("Couldn't publish your post. Please try again.");
    setText(""); setKind(null); setOpen(false);
    inv("posts");
    toast.success("Posted to your network");
  };
  return (
    <div className="surface p-4">
      <div className="flex gap-3">
        <UserAvatar user={{ id: meId, name: meName }} size={44} />
        <textarea
          value={text} onFocus={() => setOpen(true)} onChange={(e) => setText(e.target.value)} maxLength={3000}
          placeholder="Share something with your network…" rows={open ? 3 : 1}
          className="flex-1 resize-none rounded-2xl border bg-muted px-4 py-2.5 text-sm outline-none transition-all focus:border-lime focus:bg-card"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        {kinds.map((k) => (
          <button key={k.k} onClick={() => { setKind(kind === k.k ? null : k.k); setOpen(true); }}
            className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground", kind === k.k && "bg-lime text-lime-foreground hover:bg-lime")}>
            <k.icon className="size-4" />{k.label}
          </button>
        ))}
        {open && <Button variant="lime" className="ml-auto" disabled={!text.trim() || busy} onClick={submit}>{busy ? "Posting…" : "Post"}</Button>}
      </div>
    </div>
  );
}
