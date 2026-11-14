import { Suspense } from "react";
import { StudentQuizDetailsPage } from "@acadly/modules/user/quizzes/components/StudentQuizDetailsPage";
import { PageLoading } from "@acadly/infrastructure/components/common/PageLoading";

type QuizDetailsProps = {
  params: Promise<{ id: string }>;
};

export default function QuizDetailsRoute({ params }: QuizDetailsProps) {
  return (
    <Suspense fallback={<PageLoading label="Loading quiz details…" />}>
      <QuizRoute params={params} />
    </Suspense>
  );
}

async function QuizRoute({ params }: QuizDetailsProps) {
  const { id } = await params;
  return <StudentQuizDetailsPage quizId={id} />;
}
