import { Suspense } from "react";
import { QuizTakingPage } from "@acadly/modules/user/quizzes/components/QuizTakingPage";
import { PageLoading } from "@acadly/infrastructure/components/common/PageLoading";

type TakeQuizProps = {
  params: Promise<{ id: string }>;
};

export default function TakeQuizRoute({ params }: TakeQuizProps) {
  return (
    <Suspense fallback={<PageLoading label="Preparing your quiz…" />}>
      <TakeRoute params={params} />
    </Suspense>
  );
}

async function TakeRoute({ params }: TakeQuizProps) {
  const { id } = await params;
  return <QuizTakingPage quizId={id} />;
}
