import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  ShieldCheck,
  TrendingUp,
  Users2,
} from "lucide-react";

export default function DashboardMock() {
  return (
    <div className="bg-card">
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <div className="ml-3 hidden text-xs text-muted-foreground sm:block">
          app.scrrs.io / dashboard
        </div>
      </div>

      <div className="grid grid-cols-12 gap-0">
        {/* sidebar */}
        <div className="col-span-3 hidden border-r border-border/60 p-4 sm:block">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold">SCRRS</div>
          </div>
          <div className="mt-5 space-y-1">
            {[
              { i: Inbox, l: "Dashboard", a: true },
              { i: FileText, l: "Complaints" },
              { i: BarChart3, l: "Analytics" },
              { i: Users2, l: "Teams" },
            ].map((it, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                  it.a ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <it.i className="h-3.5 w-3.5" />
                {it.l}
              </div>
            ))}
          </div>
        </div>

        {/* main */}
        <div className="col-span-12 p-5 sm:col-span-9">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { l: "Total", v: "1,284", t: "+12%", icon: Inbox },
              {
                l: "Pending",
                v: "146",
                t: "-8%",
                icon: Clock,
                tone: "text-warning",
              },
              {
                l: "Resolved",
                v: "1,012",
                t: "+18%",
                icon: CheckCircle2,
                tone: "text-success",
              },
              {
                l: "Avg time",
                v: "2.4h",
                t: "-14%",
                icon: TrendingUp,
                tone: "text-info",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/60 bg-background/50 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.l}
                  </span>
                  <s.icon
                    className={`h-3.5 w-3.5 ${s.tone ?? "text-muted-foreground"}`}
                  />
                </div>
                <div className="mt-1.5 text-lg font-semibold tabular-nums">
                  {s.v}
                </div>
                <div className="text-[10px] text-success">{s.t}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-border/60 bg-background/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-medium">Recent complaints</div>
              <div className="text-[10px] text-muted-foreground">Live</div>
            </div>
            <div className="space-y-2">
              {[
                {
                  t: "Network outage in Block C",
                  d: "IT",
                  s: "In progress",
                  c: "bg-info/15 text-info",
                },
                {
                  t: "Leaking pipe — restroom 2F",
                  d: "Maintenance",
                  s: "Routed",
                  c: "bg-warning/15 text-warning",
                },
                {
                  t: "Projector not working",
                  d: "AV",
                  s: "Resolved",
                  c: "bg-success/15 text-success",
                },
                {
                  t: "Power flicker — Lab 4",
                  d: "Electrical",
                  s: "In progress",
                  c: "bg-info/15 text-info",
                },
              ].map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border/40 bg-card px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium">{r.t}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {r.d}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.c}`}
                  >
                    {r.s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
