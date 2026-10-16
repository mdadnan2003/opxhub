import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout, inputCls } from "@/components/opx/AuthLayout";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => seo("Log in", "Log in to OPXHUB."),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your OPXHUB account.">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); nav({ to: "/feed" }); }}>
        <input className={inputCls} type="email" placeholder="Email" required />
        <input className={inputCls} type="password" placeholder="Password" required />
        <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium hover:underline">Forgot password?</Link></div>
        <Button variant="lime" size="lg" className="w-full">Log in (preview)</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">New here? <Link to="/signup" className="font-semibold text-foreground hover:underline">Create an account</Link></p>
    </AuthLayout>
  );
}
