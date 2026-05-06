"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

   if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return (
       <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is restricted to administrators. If you believe this is a mistake,
            contact your workspace owner.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button asChild size="sm">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
