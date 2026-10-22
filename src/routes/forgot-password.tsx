import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, inputCls } from "@/components/opx/AuthLayout";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/forgot-password")({
  head: () => seo("Reset password", "Reset your OPXHUB password."),
  component: Forgot,
});

function Forgot() {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a reset link.">
      {sent ? (
        <p className="rounded-lg border bg-lime-soft p-4 text-sm">
          In the live app, a reset link would be sent now. Email isn't connected in preview mode.
        </p>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <input className={inputCls} type="email" placeholder="Email" required />
          <Button variant="lime" size="lg" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  );
}
