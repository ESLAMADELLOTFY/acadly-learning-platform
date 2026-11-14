"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { QuizSubmission, SubmissionStatus } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { Badge, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof mockLearningPlatform.listUsers>>>([]);
  const [quizzes, setQuizzes] = useState<Awaited<ReturnType<typeof mockLearningPlatform.listQuizzes>>>([]);
  const [status, setStatus] = useState<SubmissionStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      mockLearningPlatform.listSubmissions(status),
      mockLearningPlatform.listUsers(),
      mockLearningPlatform.listQuizzes(),
    ]).then(([submissionData, userData, quizData]) => {
      if (!active) return;
      setSubmissions(submissionData);
      setUsers(userData);
      setQuizzes(quizData);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Submissions could not be loaded.");
    });
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Assessment insights"
        title="Submissions & results"
        description="Track assessment outcomes and review student responses that need your attention."
      />
      {error && <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>}
      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:px-5">
          <div className="inline-flex flex-wrap gap-1 rounded-xl bg-[#f7f8f6] p-1">
            {(["all", "needs-review", "submitted", "reviewed"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                aria-pressed={status === filter}
                onClick={() => setStatus(filter)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
                  status === filter ? "bg-white text-primary shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                {filter === "all" ? "All results" : filter.replace("-", " ")}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted">{submissions.length} submissions</span>
        </div>
        {submissions.length === 0 ? (
          <div className="py-16 text-center">
            <Icon name="activity" size={24} className="mx-auto text-muted" />
            <h2 className="mt-3 text-sm font-bold">Nothing to review</h2>
            <p className="mt-1 text-xs text-muted">Submissions matching this status will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[790px] text-left">
              <thead className="bg-[#fafbfa] text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Learner</th>
                  <th scope="col" className="px-4 py-3.5">Quiz</th>
                  <th scope="col" className="px-4 py-3.5">Submitted</th>
                  <th scope="col" className="px-4 py-3.5">Score</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((submission) => {
                  const user = users.find((item) => item.id === submission.userId);
                  const quiz = quizzes.find((item) => item.id === submission.quizId);
                  return (
                    <tr key={submission.id} className="hover:bg-[#fbfcfb]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-full bg-[#edf1ee] text-[10px] font-bold text-secondary-dark">
                            {user?.name.split(" ").map((part) => part[0]).join("") ?? "ST"}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold">{user?.name ?? "Student"}</span>
                            <span className="mt-1 block text-xs text-muted">Attempt {submission.attemptNumber}</span>
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[230px] truncate px-4 py-4 text-sm text-label">{quiz?.title ?? "Quiz"}</td>
                      <td className="px-4 py-4 text-sm text-label">{new Date(submission.submittedAt).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm font-bold">{submission.score}/{submission.totalMarks}</td>
                      <td className="px-4 py-4">
                        <Badge tone={submission.status === "reviewed" ? "success" : submission.status === "needs-review" ? "warning" : "info"} dot>
                          {submission.status.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/dashboard/submissions/${submission.id}`}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-primary hover:bg-[#edf4ee]"
                        >
                          Review <Icon name="arrow-right" size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
