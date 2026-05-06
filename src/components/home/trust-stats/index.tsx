export default function TrustStats() {
  const stats = [
    { v: "98%", l: "Resolution rate" },
    { v: "3.2×", l: "Faster routing" },
    { v: "12k+", l: "Complaints handled" },
    { v: "<2h", l: "Avg. response" },
  ];
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {s.v}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}