import { Suspense } from "react";
import { QuizPreviewPage } from "@acadly/modules/admin/quizzes/components/QuizPreviewPage";
import { PageLoading } from "@acadly/infrastructure/components/common/PageLoading";

type QuizPreviewProps = {
  params: Promise<{ id: string }>;
};

export default function QuizPreviewRoute({ params }: QuizPreviewProps) {
  return (
    <Suspense fallback={<PageLoading label="Preparing quiz preview…" />}>
      <PreviewRoute params={params} />
    </Suspense>
  );
}

async function PreviewRoute({ params }: QuizPreviewProps) {
  const { id } = await params;
  return <QuizPreviewPage quizId={id} />;
}
