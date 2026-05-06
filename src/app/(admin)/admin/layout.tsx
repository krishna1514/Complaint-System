import AdminGuard from "@/components/admin/guard";
import AdminSidebar from "@/components/admin/sidebar";
import Navbar from "@/components/dashboard/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex min-h-screen flex-col gap-10 mx-5">
          <Navbar />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  );
}
