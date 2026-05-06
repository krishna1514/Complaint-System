import DashboardMock from "@/components/common/dashboard-mock";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Background gradient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-linear-to-br from-primary/20 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-info/15 blur-3xl" />
        <div className="absolute -left-32 top-60 h-[420px] w-[420px] rounded-full bg-success/10 blur-3xl" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.25] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Now with intelligent auto-routing
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Resolve complaints
            <span className="block bg-linear-to-r from-primary via-primary to-info bg-clip-text text-transparent">
              before they escalate.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            SCRRS is a smart complaint routing and resolution platform that
            automatically assigns tickets to the right teams, tracks progress in
            real time, and surfaces insights that matter.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 gap-2 px-6 shadow-md shadow-primary/20"
            >
              <Link href="/signup">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 gap-2 px-6"
            >
              <Link href="/dashboard">
                <PlayCircle className="h-4 w-4" />
                Live demo
              </Link>
            </Button>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            No credit card required · Free forever for small teams
          </p>
        </div>

        {/* Hero visual */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -inset-x-6 -inset-y-4 -z-10 rounded-[2rem] bg-linear-to-tr from-primary/30 via-info/20 to-success/20 opacity-60 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl shadow-primary/10">
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
}
