import { Suspense } from "react";
import { QuizEditor } from "@acadly/modules/admin/quizzes/components/QuizEditor";
import { PageLoading } from "@acadly/infrastructure/components/common/PageLoading";

type EditQuizProps = {
  params: Promise<{ id: string }>;
};

export default function EditQuizPage({ params }: EditQuizProps) {
  return (
    <Suspense fallback={<PageLoading label="Loading quiz…" />}>
      <QuizRoute params={params} />
    </Suspense>
  );
}

async function QuizRoute({ params }: EditQuizProps) {
  const { id } = await params;
  return <QuizEditor quizId={id} />;
}
