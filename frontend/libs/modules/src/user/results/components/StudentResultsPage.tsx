"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Quiz, QuizSubmission } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { Badge, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

export function StudentResultsPage() {
  const [results, setResults] = useState<QuizSubmission[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      mockLearningPlatform.listMyResults(),
      mockLearningPlatform.listAvailableQuizzes(),
    ]).then(([resultData, quizData]) => {
      if (!active) return;
      setResults(resultData);
      setQuizzes(quizData);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Results could not be loaded.");
    });
    return () => {
      active = false;
    };
  }, []);

  const average = results.length
    ? Math.round(results.reduce((total, result) => total + result.score / result.totalMarks * 100, 0) / results.length)
    : 0;
  const reviewed = results.filter((result) => result.status === "reviewed").length;

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Your progress"
        title="My results"
        description="Celebrate what you’ve learned and see where to focus next."
      />
      {error && <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Quiz attempts", value: results.length.toString(), icon: "book" as const },
          { label: "Average score", value: `${average}%`, icon: "activity" as const },
          { label: "Reviewed", value: `${reviewed} of ${results.length}`, icon: "check" as const },
        ].map((item) => (
          <Card key={item.label} padding="sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <Icon name={item.icon} size={17} className="text-secondary-dark" />
            </div>
            <p className="mt-3 text-2xl font-bold">{item.value}</p>
          </Card>
        ))}
      </section>
      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-bold">Assessment history</h2>
          <p className="mt-1 text-xs text-muted">Each attempt is saved so you can follow your progress.</p>
        </div>
        {results.length ? (
          <div className="divide-y divide-border">
            {results.map((result) => {
              const quiz = quizzes.find((item) => item.id === result.quizId);
              const percent = result.totalMarks
                ? Math.round((result.score / result.totalMarks) * 100)
                : 0;
              return (
                <Link
                  key={result.id}
                  href={`/dashboard/results/${result.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-surface-hover/70 sm:px-6"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ee] text-primary">
                      <Icon name="book" size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{quiz?.title ?? "Assessment"}</span>
                      <span className="mt-1 block text-xs text-muted">
                        {new Date(result.submittedAt).toLocaleString()} · Attempt {result.attemptNumber}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="text-right">
                      <span className="block text-sm font-bold">{result.score}/{result.totalMarks}</span>
                      <span className="mt-1 block text-xs text-muted">{percent}%</span>
                    </span>
                    <Badge tone={result.status === "reviewed" ? "success" : "warning"} dot>
                      {result.status === "needs-review" ? "In review" : result.status}
                    </Badge>
                    <Icon name="arrow-right" size={15} className="text-muted" />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#edf4ee] text-primary"><Icon name="activity" /></span>
            <h2 className="mt-4 font-bold">Your results will appear here</h2>
            <p className="mt-1 text-sm text-muted">Take a quiz to start your learning history.</p>
            <Link href="/dashboard/quizzes" className="mt-4 inline-flex text-sm font-bold text-primary hover:underline">Explore quizzes</Link>
          </div>
        )}
      </Card>
    </div>
  );
}
