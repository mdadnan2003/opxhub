import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, inputCls } from "@/components/opx/AuthLayout";
import { Button } from "@/components/ui/button";
import { INTERESTS } from "@/lib/mock-data";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => seo("Join OPXHUB", "Create your student profile on OPXHUB."),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const [interests, setInterests] = useState<string[]>([]);
  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute.">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); nav({ to: "/onboarding" }); }}>
        <input className={inputCls} placeholder="Full name" required />
        <input className={inputCls} type="email" placeholder="Email" required />
        <input className={inputCls} type="password" placeholder="Password (8+ characters)" minLength={8} required />
        <input className={inputCls} placeholder="College / university" required />
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Course" required />
          <input className={inputCls} type="number" placeholder="Grad year" min={2024} max={2032} required />
        </div>
        <p className="pt-2 text-sm font-semibold">Interests</p>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button type="button" key={i} onClick={() => setInterests((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i])}
              className={cn("rounded-full border px-3 py-1.5 text-sm", interests.includes(i) && "border-lime bg-lime text-lime-foreground")}>{i}</button>
          ))}
        </div>
        <Button variant="lime" size="lg" className="mt-2 w-full">Continue</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already a member? <Link to="/login" className="font-semibold text-foreground hover:underline">Log in</Link></p>
    </AuthLayout>
  );
}
