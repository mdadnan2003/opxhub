import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  Briefcase,
  Send,
  Flag,
  Trash2,
  Trophy,
  Users,
  HelpCircle,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getPreviewUser } from "@/lib/auth";
import {
  type FeedPost,
  useComments,
  useInvalidate,
  timeAgo,
  relation,
  useConnect,
  type Connection,
} from "@/lib/api";
import { getUser } from "@/lib/mock-data";
import { UserAvatar } from "./primitives";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const kindMeta = {
  achievement: { label: "Achievement", icon: Trophy },
  project: { label: "Project", icon: Code2 },
  team: { label: "Looking for team", icon: Users },
  opportunity: { label: "Opportunity", icon: Briefcase },
  question: { label: "Discussion", icon: HelpCircle },
};

type LegacyPost = {
  id: string;
  authorId: string;
  time: string;
  text: string;
  image?: string;
  kind?: "achievement" | "project" | "team" | "opportunity" | "question" | undefined;
  likes: number;
  comments: { id: string; authorId: string; text: string }[];
  reposts: number;
};

type Props = {
  post: FeedPost | LegacyPost;
  meId?: string | undefined;
  saved?: boolean | undefined;
  connections?: Connection[] | undefined;
};

export function PostCard({ post, meId, saved = false, connections }: Props) {
  const previewUser = getPreviewUser();
  const resolvedMeId = meId ?? previewUser?.id ?? "aarav";
  const inv = useInvalidate();
  const connect = useConnect();
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const legacy = "authorId" in post;
  const comments = useComments(post.id, !legacy && showComments);

  if (legacy) {
    const author = getUser(post.authorId) ?? {
      id: post.authorId,
      name: "Member",
      headline: "Student builder",
      college: "Campus",
      degree: "Student",
      year: 2027,
      skills: [],
    };
    return (
      <article className="surface">
        <div className="flex items-start gap-3 p-4 pb-2">
          <Link to="/profile/$id" params={{ id: author.id }}>
            <UserAvatar user={author} size={44} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2">
              <Link
                to="/profile/$id"
                params={{ id: author.id }}
                className="text-sm font-semibold hover:underline"
              >
                {author.name}
              </Link>
              {post.kind && <span className="chip py-0 text-[11px]">{post.kind}</span>}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {author.headline} · {author.college}
            </p>
            <p className="text-xs text-muted-foreground">{post.time}</p>
          </div>
        </div>
        {post.image && (
          <div className="px-4 pb-3">
            <img
              src={post.image}
              alt="Post image"
              className="max-h-96 w-full rounded-xl border object-cover"
            />
          </div>
        )}
        <div className="px-4 pb-3 text-sm leading-relaxed">
          <p className="whitespace-pre-line break-words">{post.text}</p>
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <span>{post.likes} reactions</span>
          <span>{post.comments.length} comments</span>
        </div>
      </article>
    );
  }

  const liked = post.likeUserIds.includes(resolvedMeId);
  const isMine = post.author.id === resolvedMeId;
  const rel = relation(connections, resolvedMeId, post.author.id);
  const long = post.body.length > 260;
  const kind = post.kind ? kindMeta[post.kind] : null;
  const author = { id: post.author.id, name: post.author.full_name || "Member" };

  const run = async (p: PromiseLike<{ error: unknown }>, keys: string[]) => {
    const { error } = await p;
    if (error) toast.error("Something went wrong. Please try again.");
    inv(...keys);
  };
  const toggleLike = () =>
    run(
      liked
        ? supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", resolvedMeId)
        : supabase.from("post_likes").insert({ post_id: post.id, user_id: resolvedMeId }),
      ["posts"],
    );
  const toggleSave = () => {
    toast(saved ? "Removed from saved" : "Saved");
    return run(
      saved
        ? supabase.from("post_saves").delete().eq("post_id", post.id).eq("user_id", resolvedMeId)
        : supabase.from("post_saves").insert({ post_id: post.id, user_id: resolvedMeId }),
      ["saves", "saved-posts"],
    );
  };
  const addComment = async () => {
    const body = comment.trim();
    if (!body) return;
    setComment("");
    await run(
      supabase.from("post_comments").insert({ post_id: post.id, user_id: resolvedMeId, body }),
      ["comments", "posts"],
    );
  };
  const remove = () =>
    run(supabase.from("posts").delete().eq("id", post.id), ["posts"]).then(() =>
      toast("Post deleted"),
    );

  return (
    <article className="surface">
      <div className="flex items-start gap-3 p-4 pb-2">
        <Link to="/profile/$id" params={{ id: author.id }}>
          <UserAvatar user={author} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <Link
              to="/profile/$id"
              params={{ id: author.id }}
              className="text-sm font-semibold hover:underline"
            >
              {author.name}
            </Link>
            {kind && (
              <span className="chip py-0 text-[11px]">
                <kind.icon className="size-3" />
                {kind.label}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {[post.author.headline, post.author.college].filter(Boolean).join(" · ")}
          </p>
          <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
        </div>
        {!isMine && rel === "none" && (
          <Button
            size="sm"
            variant="ghost"
            disabled={connect.isPending}
            onClick={() =>
              connect.mutate(
                { me: resolvedMeId, other: author.id, action: "send" },
                { onSuccess: () => toast.success(`Request sent to ${author.name}`) },
              )
            }
          >
            + Connect
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="grid size-8 place-items-center rounded-full hover:bg-muted"
            aria-label="Post options"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isMine && (
              <DropdownMenuItem onClick={remove}>
                <Trash2 className="size-4" /> Delete post
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={toggleSave}>
              <Bookmark className="size-4" /> {saved ? "Remove from Saved" : "Save"}
            </DropdownMenuItem>
            {!isMine && (
              <DropdownMenuItem onClick={() => toast("Reporting isn't available yet")}>
                <Flag className="size-4" /> Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {post.imageUrl && (
        <div className="px-4 pb-3">
          <img
            src={post.imageUrl}
            alt="Post image"
            className="max-h-96 w-full rounded-xl border object-cover"
          />
        </div>
      )}

      <div className="px-4 pb-3 text-sm leading-relaxed">
        <p className="whitespace-pre-line break-words">
          {long && !expanded ? post.body.slice(0, 260) + "…" : post.body}
        </p>
        {long && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <span>{post.likeUserIds.length} reactions</span>
        <span>{post.commentCount} comments</span>
      </div>
      <div className="grid grid-cols-4 border-t px-2 py-1">
        <Action
          active={liked}
          onClick={toggleLike}
          icon={<Heart className={cn(liked && "fill-current")} />}
          label="Like"
        />
        <Action
          onClick={() => setShowComments(!showComments)}
          icon={<MessageCircle />}
          label="Comment"
        />
        <Action
          onClick={() => {
            navigator.clipboard?.writeText(`${window.location.origin}/profile/${author.id}`);
            toast("Link copied");
          }}
          icon={<Repeat2 />}
          label="Share"
        />
        <Action
          active={saved}
          onClick={toggleSave}
          icon={<Bookmark className={cn(saved && "fill-current")} />}
          label="Save"
        />
      </div>

      {showComments && (
        <div className="space-y-3 border-t p-4">
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              maxLength={1000}
              placeholder="Add a comment…"
              className="h-9 flex-1 rounded-full border bg-muted px-4 text-sm outline-none focus:border-lime"
            />
            <Button size="icon" variant="lime" onClick={addComment} aria-label="Send comment">
              <Send />
            </Button>
          </div>
          {comments.isLoading && <p className="text-xs text-muted-foreground">Loading comments…</p>}
          {comments.data?.map((c) => (
            <div key={c.id} className="flex gap-2">
              <UserAvatar user={{ id: c.user.id, name: c.user.full_name || "Member" }} size={32} />
              <div className="rounded-xl bg-muted px-3 py-2 text-sm">
                <Link
                  to="/profile/$id"
                  params={{ id: c.user.id }}
                  className="text-xs font-semibold hover:underline"
                >
                  {c.user.full_name || "Member"}
                </Link>
                <p className="break-words">{c.body}</p>
                <button
                  className="mt-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => setComment(`@${(c.user.full_name || "").split(" ")[0]} `)}
                >
                  Reply
                </button>
              </div>
            </div>
          ))}
          {comments.data?.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No comments yet — start the conversation.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function Action({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4.5",
        active && "text-foreground",
      )}
    >
      <span className={cn(active && "rounded-full bg-lime p-1")}>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
