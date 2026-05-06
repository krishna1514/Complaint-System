import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/15 via-card to-info/10 px-6 py-16 text-center shadow-xl sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, var(--primary) 0%, transparent 40%), radial-gradient(circle at 70% 80%, var(--info) 0%, transparent 40%)",
          }}
        />
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Start managing complaints smarter.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Join teams that ship resolutions, not excuses. Get started in minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-11 gap-2 px-6 shadow-md shadow-primary/20"
          >
            <Link href="/signup">
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
