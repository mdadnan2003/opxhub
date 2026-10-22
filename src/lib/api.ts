import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPreviewUser } from "@/lib/auth";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type PostKind = "achievement" | "project" | "team" | "opportunity" | "question";
export type FeedPost = {
  id: string;
  body: string;
  kind: PostKind | null;
  created_at: string;
  imageUrl: string | null;
  author: Pick<Profile, "id" | "full_name" | "headline" | "college">;
  likeUserIds: string[];
  commentCount: number;
};

export function useUserId() {
  const [id, setId] = useState<string | null>(() => getPreviewUser()?.id ?? null);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      const previewUser = getPreviewUser();
      if (previewUser) {
        if (active) setId(previewUser.id);
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      setId(error ? null : (data.user?.id ?? null));
    };

    void sync();

    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      if (!active) return;
      const previewUser = getPreviewUser();
      setId(previewUser?.id ?? session?.user.id ?? null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return id;
}

export function useProfile(id: string | null | undefined) {
  return useQuery({
    queryKey: ["profile", id],
    enabled: !!id,
    queryFn: async () => {
      const previewUser = getPreviewUser();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      if (data) return data;

      if (previewUser && previewUser.id === id) {
        return {
          id: previewUser.id,
          full_name: previewUser.fullName,
          headline: "Student builder",
          college: previewUser.college,
          course: previewUser.degree,
          grad_year: previewUser.gradYear,
          location: null,
          about: "",
          skills: [],
          interests: previewUser.interests,
          created_at: previewUser.createdAt,
          onboarded: false,
        } as Profile;
      }

      return null;
    },
  });
}

export function useMe() {
  const id = useUserId();
  const q = useProfile(id);
  return { id, profile: q.data ?? null, isLoading: !id || q.isLoading };
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
}

const POST_SELECT =
  "id, body, kind, created_at, image_url, author:profiles!posts_author_id_fkey(id, full_name, headline, college), post_likes(user_id), post_comments(count)";
const POST_SELECT_LEGACY =
  "id, body, kind, created_at, author:profiles!posts_author_id_fkey(id, full_name, headline, college), post_likes(user_id), post_comments(count)";

type RawPost = {
  id: string;
  body: string;
  kind: string | null;
  created_at: string;
  image_url?: string | null;
  author: FeedPost["author"];
  post_likes: { user_id: string }[];
  post_comments: { count: number }[];
};
const mapPost = (p: RawPost): FeedPost => ({
  id: p.id,
  body: p.body,
  kind: p.kind as PostKind | null,
  created_at: p.created_at,
  imageUrl: p.image_url ?? null,
  author: p.author,
  likeUserIds: p.post_likes.map((l) => l.user_id),
  commentCount: p.post_comments[0]?.count ?? 0,
});

export function usePosts(filter?: { authorId?: string; ids?: string[] }) {
  return useQuery({
    queryKey: ["posts", filter ?? {}],
    queryFn: async () => {
      let q = supabase
        .from("posts")
        .select(POST_SELECT)
        .order("created_at", { ascending: false })
        .limit(100);
      if (filter?.authorId) q = q.eq("author_id", filter.authorId);
      if (filter?.ids)
        q = q.in("id", filter.ids.length ? filter.ids : ["00000000-0000-0000-0000-000000000000"]);

      const { data, error } = await q;
      if (error && /image_url/.test(error.message)) {
        let fallback = supabase
          .from("posts")
          .select(POST_SELECT_LEGACY)
          .order("created_at", { ascending: false })
          .limit(100);
        if (filter?.authorId) fallback = fallback.eq("author_id", filter.authorId);
        if (filter?.ids) {
          fallback = fallback.in(
            "id",
            filter.ids.length ? filter.ids : ["00000000-0000-0000-0000-000000000000"],
          );
        }
        const fallbackResult = await fallback;
        if (fallbackResult.error) throw fallbackResult.error;
        return (fallbackResult.data as unknown as RawPost[]).map(mapPost);
      }
      if (error) throw error;
      return (data as unknown as RawPost[]).map(mapPost);
    },
  });
}

export function useMySaves(userId: string | null) {
  return useQuery({
    queryKey: ["saves", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_saves")
        .select("post_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return new Set(data.map((d) => d.post_id));
    },
  });
}

export type SavedPost = FeedPost & {
  savedAt: string;
};

export function useSavedPosts(userId: string | null) {
  return useQuery({
    queryKey: ["saved-posts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_saves")
        .select("post_id, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      if (!data.length) return [] as SavedPost[];

      const ids = data.map((row) => row.post_id);
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .in("id", ids)
        .order("created_at", { ascending: false });

      const saveMap = new Map(data.map((row) => [row.post_id, row.created_at]));

      if (postsError && /image_url/.test(postsError.message)) {
        const fallback = await supabase
          .from("posts")
          .select(POST_SELECT_LEGACY)
          .in("id", ids)
          .order("created_at", { ascending: false });
        if (fallback.error) throw fallback.error;
        return (fallback.data as unknown as RawPost[])
          .filter(Boolean)
          .map((post) => ({
            ...mapPost(post),
            savedAt: saveMap.get(post.id) ?? post.created_at,
          }))
          .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      }
      if (postsError) throw postsError;

      return (posts as unknown as RawPost[])
        .filter(Boolean)
        .map((post) => ({
          ...mapPost(post),
          savedAt: saveMap.get(post.id) ?? post.created_at,
        }))
        .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    },
  });
}

export function useComments(postId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["comments", postId],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_comments")
        .select("id, body, created_at, user:profiles!post_comments_user_id_fkey(id, full_name)")
        .eq("post_id", postId)
        .order("created_at");
      if (error) throw error;
      return data as unknown as {
        id: string;
        body: string;
        created_at: string;
        user: { id: string; full_name: string };
      }[];
    },
  });
}

export type Connection = Tables<"connections">;
export function useConnections(userId: string | null) {
  return useQuery({
    queryKey: ["connections", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("connections").select("*");
      if (error) throw error;
      return data;
    },
  });
}

/** Relationship of the current user to another user. */
export function relation(conns: Connection[] | undefined, me: string | null, other: string) {
  const c = conns?.find(
    (x) =>
      (x.requester_id === me && x.addressee_id === other) ||
      (x.addressee_id === me && x.requester_id === other),
  );
  if (!c) return "none" as const;
  if (c.status === "accepted") return "connected" as const;
  return c.requester_id === me ? ("sent" as const) : ("received" as const);
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (...keys: string[]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}

export function useConnect() {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async ({
      me,
      other,
      action,
    }: {
      me: string;
      other: string;
      action: "send" | "accept" | "remove";
    }) => {
      if (action === "send") {
        const { error } = await supabase
          .from("connections")
          .insert({ requester_id: me, addressee_id: other });
        if (error) throw error;
      } else if (action === "accept") {
        const { error } = await supabase
          .from("connections")
          .update({ status: "accepted" })
          .eq("requester_id", other)
          .eq("addressee_id", me);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("connections")
          .delete()
          .or(
            `and(requester_id.eq.${me},addressee_id.eq.${other}),and(requester_id.eq.${other},addressee_id.eq.${me})`,
          );
        if (error) throw error;
      }
    },
    onSuccess: () => inv("connections"),
  });
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
