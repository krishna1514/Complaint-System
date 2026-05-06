import SectionHeader from "@/components/common/section-header";
import {
  Activity,
  BarChart3,
  RouteIcon,
  ShieldCheck,
  Users2,
  Zap,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: RouteIcon,
      title: "Smart routing engine",
      desc: "Keyword and category-based logic auto-assigns every complaint to the right department in milliseconds.",
    },
    {
      icon: Activity,
      title: "Real-time tracking",
      desc: "Live status updates and a clean activity timeline keep everyone in sync, from submission to resolution.",
    },
    {
      icon: Users2,
      title: "Role-based dashboards",
      desc: "Admins, staff and end-users each get a focused view with the actions and data that matter to them.",
    },
    {
      icon: BarChart3,
      title: "Analytics & insights",
      desc: "Trends, bottlenecks and SLA metrics — beautifully visualized so you can act with confidence.",
    },
    {
      icon: ShieldCheck,
      title: "Secure by default",
      desc: "Granular permissions and audit-ready activity logs so sensitive complaints stay protected.",
    },
    {
      icon: Zap,
      title: "Lightning fast UX",
      desc: "A premium interface engineered for speed — your team will actually enjoy using it.",
    },
  ];

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to handle complaints, beautifully."
          subtitle="A focused toolkit for routing, tracking and resolving complaints — without the bloat."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
