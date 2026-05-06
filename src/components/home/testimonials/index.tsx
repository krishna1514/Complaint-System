import SectionHeader from "@/components/common/section-header";
import { Quote, Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "SCRRS turned a chaotic email pile into a clean, trackable workflow. Our resolution time is down 40%.",
      name: "Priya Nair",
      role: "Operations Lead, Northwind Campus",
    },
    {
      quote:
        "The smart routing is shockingly good. Tickets land in the right hands without us lifting a finger.",
      name: "Rahul Verma",
      role: "IT Manager, Helix Labs",
    },
    {
      quote:
        "It actually looks and feels like a product people want to use. Adoption was effortless.",
      name: "Aisha Khan",
      role: "Admin Director, Meridian Group",
    },
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Testimonials"
          title="Loved by the teams that ship things."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5"
            >
              <Quote className="h-5 w-5 text-primary/70" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
                &quot;{t.quote}&quot;
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-info text-xs font-semibold text-primary-foreground">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <figcaption className="min-w-0">
                  <div className="truncate text-sm font-medium">{t.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {t.role}
                  </div>
                </figcaption>
                <div className="ml-auto flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
