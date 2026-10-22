import { createFileRoute } from "@tanstack/react-router";
import { Github, Globe, Linkedin, Instagram, Twitter, Plus, Trash2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/opx/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/settings/connections")({
  head: () =>
    seo("GitHub and social links", "Update your public profile links and social presence."),
  component: SocialLinksSettings,
});

type LinkMap = {
  github: string;
  linkedin: string;
  portfolio: string;
  instagram: string;
  x: string;
};

const initialLinks: LinkMap = {
  github: "",
  linkedin: "",
  portfolio: "",
  instagram: "",
  x: "",
};

function SocialLinksSettings() {
  const [links, setLinks] = useState<LinkMap>(initialLinks);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      toast.success("Social links saved");
    } finally {
      setSaving(false);
    }
  };

  const updateValue = (key: keyof LinkMap, value: string) => {
    setLinks((current) => ({ ...current, [key]: value }));
  };

  const removeLink = (key: keyof LinkMap) => {
    updateValue(key, "");
  };

  const rows: Array<{
    key: keyof LinkMap;
    label: string;
    icon: typeof Github;
    placeholder: string;
  }> = [
    { key: "github", label: "GitHub", icon: Github, placeholder: "https://github.com/yourname" },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      placeholder: "https://linkedin.com/in/yourname",
    },
    { key: "portfolio", label: "Portfolio", icon: Globe, placeholder: "https://yourportfolio.dev" },
    {
      key: "instagram",
      label: "Instagram",
      icon: Instagram,
      placeholder: "https://instagram.com/yourhandle",
    },
    { key: "x", label: "X / Twitter", icon: Twitter, placeholder: "https://x.com/yourhandle" },
  ];

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="surface flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
            <h1 className="mt-1 text-3xl font-semibold">GitHub & Social Links</h1>
          </div>
          <Button variant="lime" className="gap-2" onClick={onSave} disabled={saving}>
            <Save className="size-4" /> {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>

        <div className="surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="size-4 text-lime" />
            <h2 className="text-base font-semibold">Public links</h2>
          </div>

          <div className="space-y-3">
            {rows.map(({ key, label, icon: Icon, placeholder }) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-card text-foreground">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </label>
                  <Input
                    value={links[key]}
                    placeholder={placeholder}
                    onChange={(e) => updateValue(key, e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeLink(key)}
                  aria-label={`Clear ${label}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
