import { Suspense } from "react";
import { SubmissionReviewPage } from "@acadly/modules/admin/submissions/components/SubmissionReviewPage";
import { PageLoading } from "@acadly/infrastructure/components/common/PageLoading";

type ReviewSubmissionProps = {
  params: Promise<{ id: string }>;
};

export default function ReviewSubmissionPage({ params }: ReviewSubmissionProps) {
  return (
    <Suspense fallback={<PageLoading label="Loading submission…" />}>
      <SubmissionRoute params={params} />
    </Suspense>
  );
}

async function SubmissionRoute({ params }: ReviewSubmissionProps) {
  const { id } = await params;
  return <SubmissionReviewPage submissionId={id} />;
}
