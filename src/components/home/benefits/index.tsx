import SectionHeader from "@/components/common/section-header";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      icon: Zap,
      title: "Faster resolution",
      desc: "Auto-routing eliminates handoffs so issues get to the right person, instantly.",
    },
    {
      icon: CheckCircle2,
      title: "Less manual work",
      desc: "Stop triaging emails and spreadsheets — let SCRRS do the busy work for you.",
    },
    {
      icon: ShieldCheck,
      title: "Better accountability",
      desc: "Every action is logged, every status visible. No more lost complaints.",
    },
  ];
  return (
    <section
      id="benefits"
      className="border-t border-border/60 bg-muted/20 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Benefits"
          title="Built to make your team measurably better."
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">
                {b.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
