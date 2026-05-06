import { ReactNode } from "react";
import { ShieldCheck, CheckCircle2, Sparkles, Activity } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-border/60 bg-linear-to-br from-primary/15 via-background to-info/10 lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--primary) 0%, transparent 40%), radial-gradient(circle at 80% 80%, var(--info) 0%, transparent 40%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              SCRRS
            </span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              Smart Complaint Routing
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
              The fastest way to route, track and resolve complaints.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Join teams using SCRRS to deliver measurably faster resolutions
              with a workspace their staff actually enjoy.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                { i: CheckCircle2, t: "Auto-routing to the right department" },
                { i: Activity, t: "Real-time tracking and clean timelines" },
                { i: ShieldCheck, t: "Role-based access and audit logs" },
              ].map((it, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-sm text-foreground"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <it.i className="h-4 w-4" />
                  </span>
                  {it.t}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 mt-10 text-xs text-muted-foreground">
            © {new Date().getFullYear()} SCRRS. Crafted for modern teams.
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">SCRRS</span>
          </Link>
        </div>

        <div className="flex flex-col items-start h-full px-6 py-12">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Back home
          </Link>
          <div className="w-full mx-auto max-w-sm my-auto">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Login to your SCRRS workspace to continue.
              </p>
            </div>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
