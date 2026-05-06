"use client";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { userAccessor } from "@/lib/accessors/UserAccessor";

export default function Navbar() {

  const {user}=useAuth();
  const {getShortName}=userAccessor;
  const shortName=getShortName(user?.name || "");
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <div className="flex gap-2 items-center w-full">
        <div className="flex items-center">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-7" />
        </div>

        <div className="relative hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search complaints, departments, users…"
            className="h-9 pl-9 bg-muted/40 border-border/60 focus-visible:bg-background"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/60 text-xs font-semibold text-primary-foreground">
          {shortName}
        </div>
      </div>
    </header>
  );
}
