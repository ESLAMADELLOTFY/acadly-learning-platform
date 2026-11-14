import { Suspense } from "react";
import type { ReactNode } from "react";
import { AdminPortalShell } from "@acadly/modules/admin/dashboard/components/AdminPortalShell";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await mockLearningPlatform.getAdminContext();
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AdminPortalShell context={context}>{children}</AdminPortalShell>
    </Suspense>
  );
}
