import { useState } from "react";
import { Trophy, HelpCircle, Briefcase, Code2, Users, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { type PostKind, useInvalidate } from "@/lib/api";
import { getPreviewUser } from "@/lib/auth";
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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function isValidImageFile(file: File) {
  return ALLOWED_IMAGE_TYPES.has(file.type) && file.size <= MAX_IMAGE_BYTES;
}

export function Composer({ meId, meName }: { meId?: string; meName?: string }) {
  const previewUser = getPreviewUser();
  const resolvedMeId = meId ?? previewUser?.id ?? "aarav";
  const resolvedMeName = meName ?? previewUser?.fullName ?? "Aarav Mehta";
  const inv = useInvalidate();
  const [text, setText] = useState("");
  const [kind, setKind] = useState<PostKind | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isValidImageFile(file)) {
      toast.error("Please choose a JPEG, PNG, or WebP image under 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setUploadingImage(true);
    const safeUserId =
      resolvedMeId && /^[0-9a-fA-F-]{36}$/.test(resolvedMeId) ? resolvedMeId : "guest";
    const path = `${safeUserId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    try {
      const storage = supabase.storage.from("post-images");
      const { error: uploadError } = await storage.upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

      if (uploadError) {
        const message = uploadError.message.toLowerCase();
        const detail =
          message.includes("bucket") || message.includes("not found")
            ? "Upload storage is not configured for this environment. Create the post-images bucket in Supabase Storage and retry."
            : uploadError.message;
        throw new Error(detail);
      }

      const { data } = storage.getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";
      toast.error(message);
      setImageFile(null);
      setImageUrl(null);
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const submit = async () => {
    const body = text.trim();
    const nextBody = body || (imageUrl ? "Shared an image" : "");

    if (!nextBody) {
      toast.error("Write something meaningful or add an image before posting.");
      return;
    }

    if (!resolvedMeId || !/^[0-9a-fA-F-]{36}$/.test(resolvedMeId)) {
      toast.error("Please sign in before posting.");
      return;
    }

    setBusy(true);

    try {
      const insertPayload = { author_id: resolvedMeId, body: nextBody, kind };
      const { error } = imageUrl
        ? await supabase.from("posts").insert({ ...insertPayload, image_url: imageUrl })
        : await supabase.from("posts").insert(insertPayload);

      if (error) {
        if (imageUrl && /image_url/.test(error.message)) {
          const fallback = await supabase.from("posts").insert(insertPayload);
          if (fallback.error) throw fallback.error;
        } else {
          throw error;
        }
      }

      setText("");
      setKind(null);
      setImageFile(null);
      setImageUrl(null);
      setOpen(false);
      inv("posts");
      toast.success("Posted to your network");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn't publish your post.";
      toast.error(
        message.includes("image_url")
          ? "The live Supabase schema is missing the post image field. Apply the posts migration in Supabase, then retry."
          : `Couldn't publish your post. ${message}`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface p-4">
      <div className="flex gap-3">
        <UserAvatar user={{ id: resolvedMeId, name: resolvedMeName }} size={44} />
        <textarea
          value={text}
          onFocus={() => setOpen(true)}
          onChange={(e) => setText(e.target.value)}
          maxLength={3000}
          placeholder="Share something with your network…"
          rows={open ? 3 : 1}
          className="flex-1 resize-none rounded-2xl border bg-muted px-4 py-2.5 text-sm outline-none transition-all focus:border-lime focus:bg-card"
        />
      </div>

      {imageUrl && (
        <div className="relative mt-3 overflow-hidden rounded-xl border bg-muted">
          <img src={imageUrl} alt="Post preview" className="max-h-80 w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setImageUrl(null);
              setImageFile(null);
            }}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1">
        {kinds.map((k) => (
          <button
            key={k.k}
            onClick={() => {
              setKind(kind === k.k ? null : k.k);
              setOpen(true);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              kind === k.k && "bg-lime text-lime-foreground hover:bg-lime",
            )}
          >
            <k.icon className="size-4" />
            {k.label}
          </button>
        ))}

        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
            uploadingImage && "pointer-events-none opacity-60",
          )}
        >
          <ImagePlus className="size-4" />
          {uploadingImage ? "Uploading..." : "Image"}
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        {open && (
          <Button
            variant="lime"
            className="ml-auto"
            disabled={(!text.trim() && !imageUrl) || busy || uploadingImage}
            onClick={submit}
          >
            {busy ? "Posting…" : "Post"}
          </Button>
        )}
      </div>
    </div>
  );
}
