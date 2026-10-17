import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, inputCls } from "@/components/opx/AuthLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { INTERESTS, users } from "@/lib/mock-data";
import { UserAvatar } from "@/components/opx/primitives";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => seo("Set up your profile", "Personalize your OPXHUB profile and feed."),
  component: Onboarding,
});

const steps = ["Your headline", "Skills", "Follow topics", "Connect"];

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (x: string) => setPicked((s) => s.includes(x) ? s.filter((y) => y !== x) : [...s, x]);
  return (
    <AuthLayout title={steps[step]!} subtitle={`Step ${step + 1} of ${steps.length}`}>
      <Progress value={((step + 1) / steps.length) * 100} className="mb-6 [&>div]:bg-lime" />
      {step === 0 && <div className="space-y-3"><input className={inputCls} placeholder="e.g. Full-stack dev · Building in public" /><textarea className={cn(inputCls, "h-28 py-2")} placeholder="Short bio" /></div>}
      {step === 1 && <div className="flex flex-wrap gap-2">{["React", "Python", "Figma", "PyTorch", "SQL", "Rust", "Node.js", "Go"].map((s) => <button key={s} onClick={() => toggle(s)} className={cn("rounded-full border px-3 py-1.5 text-sm", picked.includes(s) && "border-lime bg-lime text-lime-foreground")}>{s}</button>)}</div>}
      {step === 2 && <div className="flex flex-wrap gap-2">{INTERESTS.map((s) => <button key={s} onClick={() => toggle(s)} className={cn("rounded-full border px-3 py-1.5 text-sm", picked.includes(s) && "border-lime bg-lime text-lime-foreground")}>{s}</button>)}</div>}
      {step === 3 && <div className="space-y-3">{users.slice(1, 5).map((u) => <div key={u.id} className="flex items-center gap-3"><UserAvatar user={u} size={36} /><div className="flex-1 text-sm"><b>{u.name}</b><p className="text-xs text-muted-foreground">{u.college}</p></div><Button size="sm" variant="outline">Connect</Button></div>)}</div>}
      <div className="mt-8 flex justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <Button variant="lime" onClick={() => step === steps.length - 1 ? nav({ to: "/feed" }) : setStep(step + 1)}>{step === steps.length - 1 ? "Go to my feed" : "Next"}</Button>
      </div>
    </AuthLayout>
  );
}
