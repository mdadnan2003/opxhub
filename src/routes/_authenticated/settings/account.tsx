import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Mail, CalendarDays, Lock, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/opx/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/seo";
import { signOutUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings/account")({
  head: () => seo("Account settings", "Manage your OPXHUB account and security preferences."),
  component: AccountSettings,
});

function AccountSettings() {
  const [email, setEmail] = useState("Loading...");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        setEmail("Not signed in");
        return;
      }

      setEmail(data.user.email ?? "No email on file");
      setCreatedAt(data.user.created_at ?? null);
    })();

    return () => {
      active = false;
    };
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      toast.success("Account settings saved");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    window.location.href = "/login";
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="surface p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Settings</p>
              <h1 className="mt-1 text-3xl font-semibold">Account</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="size-4" /> Log out
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Mail className="size-4 text-lime" />
              <h2 className="text-base font-semibold">Account information</h2>
            </div>
            <div className="space-y-4">
              <label className="block space-y-2 text-sm">
                <span className="font-medium">Email</span>
                <Input value={email} readOnly />
              </label>

              <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <CalendarDays className="size-4 text-lime" />
                  <span className="font-medium">Account created</span>
                </div>
                <p className="mt-2">
                  {createdAt ? new Date(createdAt).toLocaleDateString() : "Not available"}
                </p>
              </div>
            </div>
          </section>

          <section className="surface p-5">
            <div className="mb-4 flex items-center gap-2">
              <Lock className="size-4 text-lime" />
              <h2 className="text-base font-semibold">Authentication</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Password changes are handled by Supabase Auth and should be completed through the
                secure provider flow.
              </p>
              <p>
                Use the forgot-password flow for reset requests or your provider’s password update
                flow for account recovery.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => (window.location.href = "/forgot-password")}>
                Reset password
              </Button>
              <Button variant="lime" onClick={saveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save settings"}
              </Button>
            </div>
          </section>
        </div>

        <section className="surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-4 text-lime" />
            <h2 className="text-base font-semibold">Privacy and security</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">Public profile</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Visible to authenticated members of the platform.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">Connection visibility</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Controlled by the app’s profile and connection permissions.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">Session security</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Supabase session is used for authenticated requests.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
