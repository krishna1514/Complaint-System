import SectionHeader from "@/components/common/section-header";
import { Cpu, FileText, GitBranch } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Submit a complaint",
      desc: "Users file a complaint in seconds with a clean, guided form — on any device.",
    },
    {
      icon: Cpu,
      title: "Auto-route to the right team",
      desc: "Our smart engine analyses the issue and instantly assigns it to the right department.",
    },
    {
      icon: GitBranch,
      title: "Track & resolve",
      desc: "Follow status updates in real time and close the loop with full activity history.",
    },
  ];

  return (
    <section
      id="how"
      className="border-t border-border/60 bg-muted/20 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="From complaint to resolution in three simple steps."
          subtitle="A clear, opinionated workflow that just works — for users and admins alike."
        />

        <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* connector line */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-card text-primary shadow-sm">
                <s.icon className="h-5 w-5" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground shadow-sm">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
