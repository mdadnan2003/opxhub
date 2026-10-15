import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Users, Trophy, Briefcase, Code2 } from "lucide-react";
import { Logo } from "@/components/opx/primitives";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";
import hero from "@/assets/post-hackathon.jpg";

export const Route = createFileRoute("/")({
  head: () => seo("The social network for student builders", "OPXHUB helps students network, showcase projects, find hackathon teammates and discover internships."),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="min-h-screen bg-ink text-ink-foreground">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Logo dark />
        <div className="flex gap-2">
          <Button asChild variant="ghost" className="text-ink-foreground hover:bg-ink-2"><Link to="/login">Log in</Link></Button>
          <Button asChild variant="lime"><Link to="/signup">Join now</Link></Button>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <span className="chip border-ink-2 bg-ink-2 text-lime">For students, devs & hackathon builders</span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] md:text-6xl">
            Build your network <br />before your <span className="text-lime">first job.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg opacity-70">Share projects, find teammates for your next hackathon, and discover internships — with people who build like you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="lime"><Link to="/signup">Create your profile <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="border-ink-2 bg-transparent text-ink-foreground hover:bg-ink-2"><Link to="/feed">Explore the feed</Link></Button>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="Students celebrating a hackathon win" width={1280} height={720} className="rounded-2xl border border-ink-2 object-cover" />
          <div className="absolute -bottom-6 -left-4 rounded-xl bg-card p-4 text-card-foreground shadow-[var(--shadow-pop)]">
            <p className="text-xs text-muted-foreground">Priya Nair · BITS Pilani</p>
            <p className="text-sm font-semibold">🏆 We won HackBLR 2026!</p>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 pt-8 md:grid-cols-4">
        {[
          { i: Users, t: "Network", d: "Connect with builders across colleges." },
          { i: Code2, t: "Showcase", d: "Post projects and milestones." },
          { i: Trophy, t: "Find your team", d: "Recruit teammates for hackathons." },
          { i: Briefcase, t: "Opportunities", d: "Internships shared by the community." },
        ].map((f) => (
          <div key={f.t} className="rounded-xl border border-ink-2 bg-ink-2 p-5">
            <f.i className="size-5 text-lime" />
            <p className="mt-4 font-semibold">{f.t}</p>
            <p className="mt-1 text-sm opacity-60">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
