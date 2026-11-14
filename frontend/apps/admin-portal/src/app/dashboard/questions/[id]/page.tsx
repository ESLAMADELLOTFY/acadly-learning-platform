import { Suspense } from "react";
import { QuestionEditor } from "@acadly/modules/admin/quizzes/components/QuestionEditor";
import { PageLoading } from "@acadly/infrastructure/components/common/PageLoading";

type EditQuestionProps = {
  params: Promise<{ id: string }>;
};

export default function EditQuestionPage({ params }: EditQuestionProps) {
  return (
    <Suspense fallback={<PageLoading label="Loading question…" />}>
      <QuestionRoute params={params} />
    </Suspense>
  );
}

async function QuestionRoute({ params }: EditQuestionProps) {
  const { id } = await params;
  return <QuestionEditor questionId={id} />;
}
