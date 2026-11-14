"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Question, Quiz } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { Badge, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

export function QuizPreviewPage({ quizId }: { quizId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.all([
      mockLearningPlatform.getQuiz(quizId),
      mockLearningPlatform.listQuestions(),
    ]).then(([quizData, questionData]) => {
      if (!active) return;
      if (!quizData) {
        setError("This quiz could not be found.");
      } else {
        setQuiz(quizData);
        setQuestions(quizData.questionIds
          .map((id) => questionData.find((question) => question.id === id))
          .filter((question): question is Question => question !== undefined));
      }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Quiz preview could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [quizId]);

  if (loading) return <p className="py-16 text-center text-sm text-muted">Preparing quiz preview…</p>;
  if (!quiz) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/quizzes" className="text-sm font-semibold text-primary hover:underline">Back to quizzes</Link>
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error ?? "Quiz not found."}</div>
      </div>
    );
  }
  const totalMarks = questions.reduce((total, question) => total + question.marks, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeading
        eyebrow="Learner preview"
        title={quiz.title}
        description={quiz.description}
        actions={
          <>
            <Link href={`/dashboard/quizzes/${quiz.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-label hover:bg-surface-hover">
              <Icon name="edit" size={15} /> Edit quiz
            </Link>
            <Link href="/dashboard/quizzes" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-light">
              <Icon name="arrow-left" size={15} /> Back to quizzes
            </Link>
          </>
        }
      />
      <Card className="bg-[#f0f5f0]">
        <div className="flex flex-wrap gap-2">
          <Badge tone={quiz.status === "published" ? "success" : "neutral"} dot>{quiz.status}</Badge>
          <Badge>{quiz.durationMinutes} minutes</Badge>
          <Badge>{totalMarks} total marks</Badge>
          <Badge>{quiz.passingMarks} marks to pass</Badge>
        </div>
        {quiz.instructions && (
          <div className="mt-5 border-t border-[#dce7dc] pt-4">
            <h2 className="text-sm font-bold">Instructions</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{quiz.instructions}</p>
          </div>
        )}
      </Card>
      <section aria-label="Quiz questions" className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4ee] text-xs font-bold text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone="neutral">{question.marks} marks</Badge>
                  <span className="text-xs text-muted">{question.subject} · {question.difficulty}</span>
                </div>
                <h2 className="mt-3 text-sm font-semibold leading-6">{question.prompt}</h2>
                {question.type === "multiple-choice" ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => (
                      <div key={option.id} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                        option.id === question.correctOptionId
                          ? "border-success/30 bg-[#eff8f0] font-semibold text-[#267348]"
                          : "border-border bg-white text-label"
                      }`}>
                        <span className="flex size-5 items-center justify-center rounded-full border border-current text-[10px]">
                          {option.id.toUpperCase().slice(-1)}
                        </span>
                        {option.text}
                        {option.id === question.correctOptionId && <Icon name="check" size={15} className="ml-auto" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-border bg-input px-3.5 py-3 text-sm text-muted">
                    Student response
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
