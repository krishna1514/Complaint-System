import DashboardMock from "@/components/common/dashboard-mock";
import SectionHeader from "@/components/common/section-header";

export default function Preview() {
  return (
    <section id="preview" className="py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Product preview"
          title="A workspace your team will love opening."
          subtitle="Crafted with the care of modern SaaS design — not a college template."
        />

        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute -inset-x-4 -inset-y-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-info/15 to-success/15 opacity-50 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl">
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
}