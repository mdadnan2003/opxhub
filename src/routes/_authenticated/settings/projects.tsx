import { createFileRoute } from "@tanstack/react-router";
import { PencilLine, Plus, Trash2, ExternalLink, Code2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/opx/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMe, usePosts } from "@/lib/api";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/settings/projects")({
  head: () => seo("My projects", "Manage your OPXHUB project showcase in one place."),
  component: ProjectsSettings,
});

type ProjectDraft = {
  title: string;
  summary: string;
  stack: string;
  link: string;
  status: string;
};

const emptyDraft: ProjectDraft = {
  title: "",
  summary: "",
  stack: "",
  link: "",
  status: "In Progress",
};

function ProjectsSettings() {
  const { id } = useMe();
  const { data: posts = [] } = usePosts(id ? { authorId: id } : {});
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const projectPosts = useMemo(() => posts.filter((post) => post.kind === "project"), [posts]);

  const parseProject = (post: { body: string }) => {
    const lines = post.body
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const title = lines[0] || "Untitled project";
    const summary = lines.slice(1).join(" ") || "Project showcase";
    return { title, summary };
  };

  const resetDraft = () => {
    setDraft(emptyDraft);
    setSelectedId(null);
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!id) return;
    const title = draft.title.trim();
    const summary = draft.summary.trim();
    if (!title || !summary) {
      toast.error("Please provide a project title and summary.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        author_id: id,
        kind: "project",
        body: [
          title,
          summary,
          draft.stack ? `Tech stack: ${draft.stack}` : "",
          draft.link ? `Demo: ${draft.link}` : "",
          `Status: ${draft.status}`,
        ]
          .filter(Boolean)
          .join("\n"),
      };

      if (selectedId) {
        const { error } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", selectedId)
          .eq("author_id", id);
        if (error) throw error;
        toast.success("Project updated");
      } else {
        const { error } = await supabase.from("posts").insert({ ...payload, author_id: id });
        if (error) throw error;
        toast.success("Project added");
      }

      resetDraft();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save the project.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!id) return;
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", id);
      if (error) throw error;
      toast.success("Project removed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete the project.";
      toast.error(message);
    }
  };

  const handleEdit = (post: { id: string; body: string }) => {
    const lines = post.body.split("\n");
    const title = lines[0]?.trim() ?? "";
    const summary = lines.slice(1, 3).join(" ");
    const techLine = lines.find((line) => line.toLowerCase().startsWith("tech stack:"));
    const linkLine = lines.find((line) => line.toLowerCase().startsWith("demo:"));
    const statusLine = lines.find((line) => line.toLowerCase().startsWith("status:"));

    setSelectedId(post.id);
    setDraft({
      title,
      summary,
      stack: techLine ? techLine.replace(/^tech stack:\s*/i, "") : "",
      link: linkLine ? linkLine.replace(/^demo:\s*/i, "") : "",
      status: statusLine ? statusLine.replace(/^status:\s*/i, "") : "In Progress",
    });
    setOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="surface flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Portfolio</p>
            <h1 className="mt-1 text-3xl font-semibold">My Projects</h1>
          </div>
          <Button
            variant="lime"
            className="gap-2"
            onClick={() => {
              setDraft(emptyDraft);
              setSelectedId(null);
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Add project
          </Button>
        </div>

        {open && (
          <section className="surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Code2 className="size-4 text-lime" />
              <h2 className="text-base font-semibold">
                {selectedId ? "Edit project" : "Add project"}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm md:col-span-2">
                <span className="font-medium">Project title</span>
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft((curr) => ({ ...curr, title: e.target.value }))}
                />
              </label>
              <label className="space-y-2 text-sm md:col-span-2">
                <span className="font-medium">Summary</span>
                <Textarea
                  rows={4}
                  value={draft.summary}
                  onChange={(e) => setDraft((curr) => ({ ...curr, summary: e.target.value }))}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Tech stack</span>
                <Input
                  value={draft.stack}
                  onChange={(e) => setDraft((curr) => ({ ...curr, stack: e.target.value }))}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Status</span>
                <Input
                  value={draft.status}
                  onChange={(e) => setDraft((curr) => ({ ...curr, status: e.target.value }))}
                />
              </label>
              <label className="space-y-2 text-sm md:col-span-2">
                <span className="font-medium">Live demo or project link</span>
                <Input
                  value={draft.link}
                  onChange={(e) => setDraft((curr) => ({ ...curr, link: e.target.value }))}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={resetDraft}>
                Cancel
              </Button>
              <Button variant="lime" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : selectedId ? "Save changes" : "Add project"}
              </Button>
            </div>
          </section>
        )}

        <section className="space-y-3">
          {projectPosts.length === 0 ? (
            <div className="surface p-8 text-center text-sm text-muted-foreground">
              You have not added any public projects yet.
            </div>
          ) : (
            projectPosts.map((post) => {
              const { title, summary } = parseProject(post);
              return (
                <div key={post.id} className="surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        className="gap-2"
                      >
                        <PencilLine className="size-4" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="gap-2 text-red-500"
                      >
                        <Trash2 className="size-4" /> Delete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {post.body.includes("Demo:") && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
                        <ExternalLink className="size-3.5" /> Link available
                      </span>
                    )}
                    {post.body.includes("Status:") && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
                        {post.body.split("Status:").at(1)?.trim() || "Status"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </AppShell>
  );
}
