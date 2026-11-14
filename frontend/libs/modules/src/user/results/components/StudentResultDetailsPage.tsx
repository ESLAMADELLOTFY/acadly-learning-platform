"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StudentSubmissionDetails } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { Badge, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

export function StudentResultDetailsPage({ resultId }: { resultId: string }) {
  const [details, setDetails] = useState<StudentSubmissionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const resultDetails = await mockLearningPlatform.getMyResult(resultId);
        if (!active) return;
        if (!resultDetails) {
          setError("This result could not be found.");
          return;
        }
        setDetails(resultDetails);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Result could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [resultId]);

  if (loading) return <p className="py-16 text-center text-sm text-muted">Loading result…</p>;
  if (!details) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/results" className="text-sm font-semibold text-primary hover:underline">Back to results</Link>
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error ?? "Result not found."}</div>
      </div>
    );
  }

  const { submission: result, quiz, questions } = details;
  const percent = result.totalMarks
    ? Math.round((result.score / result.totalMarks) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeading
        eyebrow="Assessment result"
        title={quiz.title}
        description={`Attempt ${result.attemptNumber} · Completed ${new Date(result.submittedAt).toLocaleString()}`}
        actions={
          <Link href="/dashboard/results" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-label hover:bg-surface-hover">
            <Icon name="arrow-left" size={16} /> All results
          </Link>
        }
      />
      <Card className="flex flex-col items-center gap-5 bg-[#173c2c] py-8 text-center text-white sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Your score</p>
          <p className="mt-2 text-4xl font-bold">{percent}<span className="text-2xl">%</span></p>
          <p className="mt-1 text-sm text-white/70">{result.score} out of {result.totalMarks} marks</p>
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <Badge className="bg-white/10 text-white" tone={result.status === "reviewed" ? "success" : "warning"} dot>
            {result.status === "needs-review" ? "Awaiting instructor review" : result.status}
          </Badge>
          {result.status === "reviewed" && (
            <p className="text-xs text-white/55">Your answers have been reviewed.</p>
          )}
        </div>
      </Card>
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold">Answer summary</h2>
          <p className="mt-1 text-xs text-muted">Review your responses and instructor feedback.</p>
        </div>
        {result.answers.map((answer, index) => {
          const question = questions.find((item) => item.id === answer.questionId);
          return (
            <Card key={answer.questionId}>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4ee] text-xs font-bold text-primary">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-6">{question?.prompt ?? "Question"}</h3>
                    <Badge tone={answer.awardedMarks === undefined ? "warning" : answer.awardedMarks > 0 ? "success" : "neutral"}>
                      {answer.awardedMarks === undefined ? "In review" : `${answer.awardedMarks} marks`}
                    </Badge>
                  </div>
                  <div className="mt-3 rounded-xl bg-[#f7f8f6] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Your answer</p>
                    <p className="mt-1 text-sm">{answer.answer || "No answer provided"}</p>
                  </div>
                  {answer.feedback && (
                    <p className="mt-3 flex items-start gap-2 text-sm leading-5 text-muted-foreground">
                      <Icon name="sparkles" size={16} className="mt-0.5 shrink-0 text-secondary-dark" />
                      {answer.feedback}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </section>
      <div className="flex justify-end">
        <Link href={`/dashboard/quizzes/${quiz.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          View this quiz <Icon name="arrow-right" size={15} />
        </Link>
      </div>
    </div>
  );
}
