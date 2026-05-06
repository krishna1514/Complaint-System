import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/70 text-primary-foreground">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span className="text-[15px] font-semibold tracking-tight">
                SCRRS
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Smart Complaint Routing & Resolution System — built for modern
              teams.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Features", to: "/#features" },
              { label: "How it works", to: "/#how" },
              { label: "Preview", to: "/#preview" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { label: "Sign in", to: "/login" },
              { label: "Create account", to: "/signup" },
              { label: "Dashboard", to: "/dashboard" },
            ]}
          />
          {/* <FooterCol
            title="Company"
            links={[
              { label: "About", to: "/" },
              { label: "Contact", to: "/" },
              { label: "Privacy", to: "/" },
            ]}
          /> */}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} SCRRS. All rights reserved.</p>
          <p>Crafted for modern complaint workflows.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
