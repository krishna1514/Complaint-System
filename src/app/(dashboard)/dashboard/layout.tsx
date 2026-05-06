import { ProtectedRoute } from "@/components/common/protected-route";
import { PropsWithChildren } from "react";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div>
      <ProtectedRoute>{children}</ProtectedRoute>
    </div>
  );
}
