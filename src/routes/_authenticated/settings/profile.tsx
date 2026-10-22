import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  PencilLine,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/opx/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/api";
import { seo } from "@/lib/seo";

const defaultLinks = {
  github: "",
  portfolio: "",
  linkedin: "",
};

export const Route = createFileRoute("/_authenticated/settings/profile")({
  head: () => seo("Edit profile", "Update your OPXHUB profile, portfolio links, and skills."),
  component: ProfileSettings,
});

function ProfileSettings() {
  const { profile, id } = useMe();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    college: "",
    course: "",
    grad_year: "2027",
    location: "",
    about: "",
    skills: ["React", "Product", "Design"],
    interests: ["Web Development", "AI/ML"],
    github: "",
    portfolio: "",
    linkedin: "",
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      headline: profile.headline ?? "",
      college: profile.college ?? "",
      course: profile.course ?? "",
      grad_year: String(profile.grad_year ?? 2027),
      location: profile.location ?? "",
      about: profile.about ?? "",
      skills:
        Array.isArray(profile.skills) && profile.skills.length
          ? profile.skills
          : ["React", "Product", "Design"],
      interests:
        Array.isArray(profile.interests) && profile.interests.length
          ? profile.interests
          : ["Web Development", "AI/ML"],
      github: "",
      portfolio: "",
      linkedin: "",
    });
  }, [profile]);

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return (
      form.full_name !== (profile.full_name ?? "") ||
      form.headline !== (profile.headline ?? "") ||
      form.college !== (profile.college ?? "") ||
      form.course !== (profile.course ?? "") ||
      String(form.grad_year || 2027) !== String(profile.grad_year ?? 2027) ||
      form.location !== (profile.location ?? "") ||
      form.about !== (profile.about ?? "") ||
      JSON.stringify(form.skills) !==
        JSON.stringify(profile.skills ?? ["React", "Product", "Design"])
    );
  }, [form, profile]);

  if (!profile || !id) {
    return (
      <AppShell>
        <div className="surface p-10 text-center text-sm text-muted-foreground">
          Loading your profile…
        </div>
      </AppShell>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim() || profile.full_name || "Student Builder",
        headline: form.headline.trim() || "Student builder",
        college: form.college.trim() || "",
        course: form.course.trim() || "",
        grad_year: Number(form.grad_year || 2027),
        location: form.location.trim() || null,
        about: form.about.trim() || "",
        skills: Array.from(new Set(form.skills.map((item) => item.trim()).filter(Boolean))),
        interests: Array.from(new Set(form.interests.map((item) => item.trim()).filter(Boolean))),
      };

      const { error } = await supabase.from("profiles").update(payload).eq("id", id);
      if (error) throw error;

      toast.success("Profile saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Profile could not be saved.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (value: string) => {
    const skill = value.trim();
    if (!skill) return;
    setForm((curr) => ({ ...curr, skills: Array.from(new Set([...curr.skills, skill])) }));
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setForm((curr) => ({ ...curr, skills: curr.skills.filter((item) => item !== skill) }));
  };

  return (
    <AppShell>
      <div className="space-y-4 pb-8">
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <Link
                to="/profile/$id"
                params={{ id: id }}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Back to profile
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                Reset
              </Button>
              <Button
                type="button"
                variant="lime"
                onClick={saveProfile}
                disabled={saving || !hasChanges}
              >
                <Save className="mr-2 size-4" /> {saving ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-border bg-muted p-3 text-foreground">
                  <UserRound className="size-8" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Profile editor
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold">Personal details</h1>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-lime" />
                {Math.min(100, 72 + form.skills.length * 3)}% complete
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <PencilLine className="size-4 text-lime" />
                    <h2 className="text-base font-semibold">About</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-foreground">Full name</span>
                      <Input
                        value={form.full_name}
                        onChange={(e) =>
                          setForm((curr) => ({ ...curr, full_name: e.target.value }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-foreground">Headline</span>
                      <Input
                        value={form.headline}
                        onChange={(e) => setForm((curr) => ({ ...curr, headline: e.target.value }))}
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-foreground">College / Organization</span>
                      <Input
                        value={form.college}
                        onChange={(e) => setForm((curr) => ({ ...curr, college: e.target.value }))}
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-foreground">Degree / Role</span>
                      <Input
                        value={form.course}
                        onChange={(e) => setForm((curr) => ({ ...curr, course: e.target.value }))}
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-foreground">Location</span>
                      <Input
                        value={form.location}
                        onChange={(e) => setForm((curr) => ({ ...curr, location: e.target.value }))}
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-foreground">Grad year</span>
                      <Input
                        type="number"
                        value={form.grad_year}
                        onChange={(e) =>
                          setForm((curr) => ({ ...curr, grad_year: e.target.value }))
                        }
                      />
                    </label>
                  </div>
                  <label className="mt-4 block space-y-2 text-sm">
                    <span className="font-medium text-foreground">Bio</span>
                    <Textarea
                      value={form.about}
                      rows={5}
                      onChange={(e) => setForm((curr) => ({ ...curr, about: e.target.value }))}
                    />
                  </label>
                </section>

                <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <GraduationCap className="size-4 text-lime" />
                    <h2 className="text-base font-semibold">Skills & interests</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-foreground"
                      >
                        {skill}
                        <button
                          type="button"
                          aria-label={`Remove ${skill}`}
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => removeSkill(skill)}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(newSkill);
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => addSkill(newSkill)}>
                      Add
                    </Button>
                  </div>
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-foreground">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {form.interests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-lime-soft px-2.5 py-1 text-xs font-medium text-foreground"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BriefcaseBusiness className="size-4 text-lime" />
                    <h2 className="text-base font-semibold">Portfolio & links</h2>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(defaultLinks).map(([key, value]) => (
                      <label key={key} className="block space-y-2 text-sm">
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          {key === "github" && <Github className="size-4" />}
                          {key === "portfolio" && <Globe className="size-4" />}
                          {key === "linkedin" && <Linkedin className="size-4" />}
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <div className="relative">
                          <Input
                            value={form[key as keyof typeof form] as string}
                            onChange={(e) =>
                              setForm((curr) => ({ ...curr, [key]: e.target.value }))
                            }
                            placeholder={`https://${key}.com/your-name`}
                          />
                          {value && (
                            <ExternalLink className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Quick summary
                  </p>
                  <h3 className="text-xl font-semibold">{form.full_name || "Student Builder"}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {form.headline || "Student builder"}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-foreground">
                    <p>{form.college || "University"}</p>
                    <p>{form.course || "Course / role"}</p>
                    <p>{form.location || "Location"}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-3 text-sm font-semibold">Profile checklist</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center justify-between">
                      <span>Headline</span>
                      <span>{form.headline ? "Set" : "Missing"}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Bio</span>
                      <span>{form.about ? "Set" : "Missing"}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Skills</span>
                      <span>{form.skills.length}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Portfolio</span>
                      <span>{form.portfolio ? "Added" : "Optional"}</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Plus className="size-4 text-lime" /> Add more sections
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Projects, hackathons, certifications, and open-source work can be expanded here
                    as your profile grows.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
