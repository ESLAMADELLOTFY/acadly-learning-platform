import { Suspense } from "react";
import type { ReactNode } from "react";
import { StudentPortalShell } from "@acadly/modules/user/dashboard/components/StudentPortalShell";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";

export default async function LearningLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await mockLearningPlatform.getStudentContext();
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f8f6]" />}>
      <StudentPortalShell context={context}>{children}</StudentPortalShell>
    </Suspense>
  );
}
