import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Briefcase, Send, Flag, Pencil, Trophy, Users, HelpCircle, Code2 } from "lucide-react";
import { toast } from "sonner";
import { getUser, me, type Post } from "@/lib/mock-data";
import { useStore, toggleIn, setState } from "@/lib/store";
import { UserAvatar, UserLink } from "./primitives";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const kindMeta = {
  achievement: { label: "Achievement", icon: Trophy },
  project: { label: "Project", icon: Code2 },
  team: { label: "Looking for team", icon: Users },
  opportunity: { label: "Opportunity", icon: Briefcase },
  question: { label: "Discussion", icon: HelpCircle },
};

export function PostCard({ post }: { post: Post }) {
  const author = getUser(post.authorId)!;
  const liked = useStore((s) => s.liked.has(post.id));
  const saved = useStore((s) => s.saved.has(post.id));
  const connected = useStore((s) => s.connected.has(author.id) || s.pending.has(author.id));
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const long = post.text.length > 220;
  const isMine = author.id === me.id;
  const kind = post.kind ? kindMeta[post.kind] : null;

  const addComment = () => {
    if (!comment.trim()) return;
    setState((s) => ({
      posts: s.posts.map((p) => p.id === post.id ? { ...p, comments: [...p.comments, { id: crypto.randomUUID(), authorId: me.id, text: comment.trim() }] } : p),
    }));
    setComment("");
  };

  return (
    <article className="surface">
      <div className="flex items-start gap-3 p-4 pb-2">
        <UserAvatar user={author} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <UserLink user={author} className="text-sm" />
            {kind && <span className="chip py-0 text-[11px]"><kind.icon className="size-3" />{kind.label}</span>}
          </div>
          <p className="truncate text-xs text-muted-foreground">{author.headline} · {author.college}</p>
          <p className="text-xs text-muted-foreground">{post.time}</p>
        </div>
        {!isMine && !connected && (
          <Button size="sm" variant="ghost" onClick={() => { toggleIn("pending", author.id); toast.success(`Request sent to ${author.name}`); }}>+ Connect</Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="grid size-8 place-items-center rounded-full hover:bg-muted" aria-label="Post options"><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isMine && <DropdownMenuItem onClick={() => toast("Editing isn't available in preview mode")}><Pencil className="size-4" /> Edit post</DropdownMenuItem>}
            <DropdownMenuItem onClick={() => { toggleIn("saved", post.id); }}><Bookmark className="size-4" /> {saved ? "Unsave" : "Save"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Thanks — report submitted for review")}><Flag className="size-4" /> Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-4 pb-3 text-sm leading-relaxed">
        <p className="whitespace-pre-line">{long && !expanded ? post.text.slice(0, 220) + "…" : post.text}</p>
        {long && <button onClick={() => setExpanded(!expanded)} className="mt-1 text-sm font-semibold text-muted-foreground hover:text-foreground">{expanded ? "See less" : "See more"}</button>}
      </div>

      {post.image && <img src={post.image} alt="" loading="lazy" width={1280} height={720} className="aspect-video w-full border-y object-cover" />}

      {post.opportunity && (
        <div className="mx-4 mb-3 flex items-center gap-3 rounded-lg border bg-muted p-3">
          <span className="grid size-10 place-items-center rounded-lg bg-ink text-lime"><Briefcase className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{post.opportunity.title}</p>
            <p className="text-xs text-muted-foreground">{post.opportunity.org} · {post.opportunity.mode} · Apply by {post.opportunity.deadline}</p>
          </div>
          <Button size="sm" variant="lime">View</Button>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <span>{post.likes + (liked ? 1 : 0)} reactions</span>
        <span>{post.comments.length} comments · {post.reposts} reposts</span>
      </div>
      <div className="grid grid-cols-4 border-t px-2 py-1">
        <Action active={liked} onClick={() => toggleIn("liked", post.id)} icon={<Heart className={cn(liked && "fill-current")} />} label="Like" />
        <Action onClick={() => setShowComments(!showComments)} icon={<MessageCircle />} label="Comment" />
        <Action onClick={() => toast.success("Reposted to your network")} icon={<Repeat2 />} label="Repost" />
        <Action active={saved} onClick={() => { toggleIn("saved", post.id); toast(saved ? "Removed from saved" : "Saved"); }} icon={<Bookmark className={cn(saved && "fill-current")} />} label="Save" />
      </div>

      {showComments && (
        <div className="space-y-3 border-t p-4">
          <div className="flex gap-2">
            <UserAvatar user={me} size={32} />
            <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()}
              placeholder="Add a comment…" className="h-9 flex-1 rounded-full border bg-muted px-4 text-sm outline-none focus:border-lime" />
            <Button size="icon" variant="lime" onClick={addComment} aria-label="Send"><Send /></Button>
          </div>
          {post.comments.map((c) => {
            const u = getUser(c.authorId)!;
            return (
              <div key={c.id} className="flex gap-2">
                <UserAvatar user={u} size={32} />
                <div className="rounded-xl bg-muted px-3 py-2 text-sm">
                  <UserLink user={u} className="text-xs" />
                  <p>{c.text}</p>
                  <button className="mt-1 text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={() => setComment(`@${u.name.split(" ")[0]} `)}>Reply</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function Action({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={cn("flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4.5", active && "text-foreground [&_svg]:text-foreground")}>
      <span className={cn(active && "rounded-full bg-lime p-1")}>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
