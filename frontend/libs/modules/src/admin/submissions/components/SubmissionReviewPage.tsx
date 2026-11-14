"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { QuizSubmission, SubmissionAnswer } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";
import { usePortalPermissions } from "@acadly/modules/shared/providers/PermissionContext";
import { Badge, Button, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

type SubmissionReviewPageProps = {
  submissionId: string;
};

export function SubmissionReviewPage({ submissionId }: SubmissionReviewPageProps) {
  const permissions = usePortalPermissions();
  const canReview = hasPermission(permissions, "submissions.review");
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [studentName, setStudentName] = useState("");
  const [questions, setQuestions] = useState<Awaited<ReturnType<typeof mockLearningPlatform.listQuestions>>>([]);
  const [answers, setAnswers] = useState<SubmissionAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [submissionData, questionData, users, quizzes] = await Promise.all([
          mockLearningPlatform.getSubmission(submissionId),
          mockLearningPlatform.listQuestions(),
          mockLearningPlatform.listUsers(),
          mockLearningPlatform.listQuizzes(),
        ]);
        if (!active) return;
        if (!submissionData) {
          setError("This submission could not be found.");
          return;
        }
        const quiz = quizzes.find((item) => item.id === submissionData.quizId);
        const user = users.find((item) => item.id === submissionData.userId);
        setSubmission(submissionData);
        setQuizTitle(quiz?.title ?? "Quiz");
        setStudentName(user?.name ?? "Student");
        setQuestions(questionData.filter((question) => quiz?.questionIds.includes(question.id)));
        setAnswers(submissionData.answers.map((answer) => ({ ...answer })));
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Submission could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [submissionId]);

  const totalScore = useMemo(
    () => answers.reduce((total, answer) => total + (answer.awardedMarks ?? 0), 0),
    [answers],
  );

  const updateAnswer = (questionId: string, update: Partial<SubmissionAnswer>) => {
    setAnswers((current) => current.map((answer) =>
      answer.questionId === questionId ? { ...answer, ...update } : answer,
    ));
  };

  const saveReview = async () => {
    if (!submission) return;
    setSaving(true);
    try {
      const updated = await mockLearningPlatform.reviewSubmission(submission.id, answers);
      setSubmission(updated);
      setAnswers(updated.answers);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-16 text-center text-sm text-muted">Loading submission…</p>;

  if (!submission) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/submissions" className="text-sm font-semibold text-primary hover:underline">Back to submissions</Link>
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error ?? "Submission not found."}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeading
        eyebrow="Submission review"
        title={studentName}
        description={`${quizTitle} · Attempt ${submission.attemptNumber} · Submitted ${new Date(submission.submittedAt).toLocaleString()}`}
        actions={
          <Link href="/dashboard/submissions" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-label hover:bg-surface-hover">
            <Icon name="arrow-left" size={16} /> All submissions
          </Link>
        }
      />
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-[#f0f5f0]">
        <div>
          <p className="text-xs font-medium text-muted">Current result</p>
          <p className="mt-1 text-2xl font-bold">{totalScore} <span className="text-base font-medium text-muted">/ {submission.totalMarks} marks</span></p>
        </div>
        <Badge tone={submission.status === "reviewed" ? "success" : "warning"} dot>{submission.status.replace("-", " ")}</Badge>
        {canReview && (
          <Button disabled={saving} onClick={() => void saveReview()}>
            {saving ? "Saving review…" : "Save review"}
          </Button>
        )}
      </Card>
      {error && <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const answer = answers.find((item) => item.questionId === question.id);
          if (!answer) return null;
          return (
            <Card key={question.id}>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4ee] text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge>{question.marks} available marks</Badge>
                    <span className="text-xs text-muted">{question.subject} · {question.type === "text" ? "Text response" : "Multiple choice"}</span>
                  </div>
                  <h2 className="mt-3 text-sm font-bold leading-6">{question.prompt}</h2>
                  <div className="mt-3 rounded-xl bg-[#f7f8f6] p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Student answer</p>
                    <p className="mt-1.5 text-sm text-foreground">{answer.answer || "No answer provided"}</p>
                  </div>
                  {question.type === "multiple-choice" && (
                    <p className="mt-2 text-xs text-muted">
                      Correct answer: {question.options.find((option) => option.id === question.correctOptionId)?.text}
                    </p>
                  )}
                  <div className="mt-4 grid gap-3 sm:grid-cols-[150px_1fr]">
                    <label className="flex flex-col gap-1.5 text-xs font-semibold text-label">
                      Awarded marks
                      <input
                        type="number"
                        min={0}
                        max={question.marks}
                        value={answer.awardedMarks ?? ""}
                        onChange={(event) => updateAnswer(question.id, {
                          awardedMarks: event.target.value === "" ? undefined : Number(event.target.value),
                        })}
                        disabled={!canReview}
                        className="min-h-10 rounded-lg border border-border bg-input px-3 text-sm outline-none focus:border-secondary disabled:opacity-70"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-xs font-semibold text-label">
                      Feedback
                      <input
                        value={answer.feedback ?? ""}
                        onChange={(event) => updateAnswer(question.id, { feedback: event.target.value })}
                        disabled={!canReview}
                        placeholder="Optional feedback for the student"
                        className="min-h-10 rounded-lg border border-border bg-input px-3 text-sm font-normal outline-none focus:border-secondary disabled:opacity-70"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {!canReview && (
        <p role="status" className="text-right text-xs text-muted">
          You have view-only access to student responses.
        </p>
      )}
    </div>
  );
}
