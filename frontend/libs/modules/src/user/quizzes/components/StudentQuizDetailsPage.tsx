"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StudentQuizDetails } from "@acadly/modules/shared/models/learning-platform";
import { getQuizAvailability } from "@acadly/modules/shared/models/quiz-availability";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { Badge, Button, Card, Icon } from "@acadly/infrastructure/components/common";

export function StudentQuizDetailsPage({ quizId }: { quizId: string }) {
  const [details, setDetails] = useState<StudentQuizDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void mockLearningPlatform.getStudentQuiz(quizId)
      .then((data) => {
        if (active) {
          setDetails(data ?? null);
          if (!data) setError("This quiz is not available.");
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Quiz details could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [quizId]);

  if (loading) return <p className="py-16 text-center text-sm text-muted">Loading quiz details…</p>;
  if (!details) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/quizzes" className="text-sm font-semibold text-primary hover:underline">Back to quizzes</Link>
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error ?? "Quiz not found."}</div>
      </div>
    );
  }
  const { quiz, questions } = details;
  const availability = getQuizAvailability(quiz);
  const totalMarks = questions.reduce((total, question) => total + question.marks, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link href="/dashboard/quizzes" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <Icon name="arrow-left" size={16} /> Explore quizzes
      </Link>
      <section className="overflow-hidden rounded-[26px] bg-[#173c2c] text-white">
        <div className="p-6 sm:p-9">
          <Badge className="bg-white/10 text-white" dot tone={availability === "available" ? "success" : "warning"}>
            {availability === "available" ? "Available now" : availability === "upcoming" ? "Coming soon" : "Availability ended"}
          </Badge>
          <h1 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">{quiz.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{quiz.description}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/75">
            <span className="inline-flex items-center gap-2"><Icon name="clock" size={16} />{quiz.durationMinutes} minutes</span>
            <span className="inline-flex items-center gap-2"><Icon name="book" size={16} />{questions.length} questions</span>
            <span>{totalMarks} total marks</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/[0.04] px-6 py-5 sm:px-9">
          <div>
            <p className="text-xs font-semibold text-white/55">Passing score</p>
            <p className="mt-1 text-sm font-bold">{quiz.passingMarks} out of {totalMarks} marks</p>
          </div>
          {availability === "available" ? (
            <Link href={`/dashboard/quizzes/${quiz.id}/take`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#173c2c] hover:bg-[#eff5ee]">
              Start quiz <Icon name="arrow-right" size={16} />
            </Link>
          ) : (
            <Button disabled variant="secondary">
              {availability === "upcoming" && quiz.availableFrom
                ? `Opens ${new Date(quiz.availableFrom).toLocaleDateString()}`
                : "Not currently available"}
            </Button>
          )}
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <h2 className="text-base font-bold">Before you begin</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Find a quiet space and make sure you have enough time to complete the assessment.
            Your answers are submitted when you finish or when the timer runs out.
          </p>
          {quiz.instructions && (
            <div className="mt-5 rounded-xl bg-[#f7f8f6] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-dark">Instructions</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-label">{quiz.instructions}</p>
            </div>
          )}
        </Card>
        <Card className="space-y-4">
          <h2 className="text-base font-bold">Quiz overview</h2>
          {[
            ["Time limit", `${quiz.durationMinutes} minutes`],
            ["Questions", questions.length.toString()],
            ["Total marks", totalMarks.toString()],
            ["Passing marks", quiz.passingMarks.toString()],
            ["Question types", [...new Set(questions.map((question) => question.type === "text" ? "Written response" : "Multiple choice"))].join(", ")],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="text-xs text-muted">{label}</span>
              <span className="text-right text-xs font-semibold">{value}</span>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
