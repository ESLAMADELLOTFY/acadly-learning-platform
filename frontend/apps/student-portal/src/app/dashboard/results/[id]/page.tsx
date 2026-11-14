import { Suspense } from "react";
import { StudentResultDetailsPage } from "@acadly/modules/user/results/components/StudentResultDetailsPage";
import { PageLoading } from "@acadly/infrastructure/components/common/PageLoading";

type ResultDetailsProps = {
  params: Promise<{ id: string }>;
};

export default function ResultDetailsRoute({ params }: ResultDetailsProps) {
  return (
    <Suspense fallback={<PageLoading label="Loading result…" />}>
      <ResultRoute params={params} />
    </Suspense>
  );
}

async function ResultRoute({ params }: ResultDetailsProps) {
  const { id } = await params;
  return <StudentResultDetailsPage resultId={id} />;
}
