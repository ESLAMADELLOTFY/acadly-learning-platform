"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MetricCard } from "@acadly/modules/admin/dashboard/components/MetricCard";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import type {
  AdminDashboardData,
  PlatformUser,
  Quiz,
  QuizSubmission,
} from "@acadly/modules/shared/models/learning-platform";
import { Badge, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";
import { ReportExportButton } from "@acadly/modules/admin/dashboard/components/ReportExportButton";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminDashboardData | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void Promise.all([
      mockLearningPlatform.getAdminDashboard(),
      mockLearningPlatform.listQuizzes(),
      mockLearningPlatform.listSubmissions(),
      mockLearningPlatform.listUsers(),
    ]).then(([dashboard, quizData, submissionData, userData]) => {
      if (!active) return;
      setOverview(dashboard);
      setQuizzes(quizData);
      setSubmissions(submissionData);
      setUsers(userData);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Dashboard data could not be loaded.");
    });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>;
  }
  if (!overview) {
    return <p className="py-16 text-center text-sm text-muted">Loading platform dashboard…</p>;
  }

  const pendingReviews = submissions.filter(
    (submission) => submission.status !== "reviewed",
  ).length;

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow={new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        title="Good morning, Olivia"
        description="Here’s an overview of your learning platform today."
        actions={
          <>
            <ReportExportButton overview={overview} />
            <Link
              href="/dashboard/quizzes/new"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-light"
            >
              <Icon name="plus" size={17} />
              Create quiz
            </Link>
          </>
        }
      />

      <section
        aria-label="Platform statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Total learners"
          value={overview.totalUsers.toLocaleString()}
          detail="Across all active accounts"
          trend="+12.8%"
          icon="users"
        />
        <MetricCard
          label="Question bank"
          value={overview.totalQuestions.toLocaleString()}
          detail="Questions ready to use"
          trend="+8 this month"
          icon="book"
        />
        <MetricCard
          label="Published quizzes"
          value={overview.activeQuizzes.toString()}
          detail={`${overview.totalQuizzes} quizzes in total`}
          icon="grid"
        />
        <MetricCard
          label="Average score"
          value={`${overview.averageScore}%`}
          detail="Across reviewed submissions"
          trend="+3.2%"
          icon="activity"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
        <Card className="min-w-0" padding="lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold">Assessment activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Submissions received over the last 7 days
              </p>
            </div>
            <Badge tone="success" dot>+12.4% this week</Badge>
          </div>
          <div
            aria-label="Daily quiz submission counts"
            className="mt-7 flex h-48 items-end justify-between gap-2 border-b border-l border-border px-2 pb-0 sm:gap-4 sm:px-4"
            role="img"
          >
            {overview.weeklySubmissions.map(({ day, submissions: count }) => {
              const height = `${Math.max(14, (count / 34) * 100)}%`;
              return (
                <div
                  key={day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[10px] font-medium text-muted">{count}</span>
                  <div
                    className="w-full max-w-10 rounded-t-lg bg-[#c4ddcb] transition-colors hover:bg-primary"
                    style={{ height }}
                    title={`${count} submissions`}
                  />
                  <span className="translate-y-6 text-[11px] text-muted">{day}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Completion rate</span>
            <span className="font-bold text-foreground">
              {overview.completionRate}%
            </span>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold">Review queue</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Submissions that need your attention
              </p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#fff4df] text-warning">
              <Icon name="activity" size={18} />
            </span>
          </div>
          <p className="mt-6 text-4xl font-bold">{pendingReviews}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Awaiting manual review
          </p>
          <div className="my-5 h-px bg-border" />
          <div className="space-y-3">
            {submissions.slice(0, 3).map((submission) => {
              const quiz = quizzes.find((item) => item.id === submission.quizId);
              const student = users.find((item) => item.id === submission.userId);
              return (
                <div key={submission.id} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#edf1ee] text-[10px] font-bold text-secondary-dark">
                    {student?.name.split(" ").map((part) => part[0]).join("") ?? "ST"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{student?.name}</p>
                    <p className="truncate text-[11px] text-muted">
                      {quiz?.title ?? "Quiz submission"}
                    </p>
                  </div>
                  <Badge
                    tone={submission.status === "reviewed" ? "success" : "warning"}
                  >
                    {submission.status === "reviewed" ? "Reviewed" : "Review"}
                  </Badge>
                </div>
              );
            })}
          </div>
          <Link
            href="/dashboard/submissions"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            Open submissions <Icon name="arrow-right" size={16} />
          </Link>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold">Recently updated quizzes</h2>
              <p className="mt-1 text-xs text-muted">Manage the latest assessments</p>
            </div>
            <Link href="/dashboard/quizzes" className="text-xs font-bold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {quizzes.slice(0, 3).map((quiz) => (
              <Link
                key={quiz.id}
                href={`/dashboard/quizzes/${quiz.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface-hover/70 sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#edf4ee] text-primary">
                    <Icon name="book" size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{quiz.title}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {quiz.questionIds.length} questions · {quiz.durationMinutes} min
                    </span>
                  </span>
                </div>
                <Badge tone={quiz.status === "published" ? "success" : "neutral"} dot>
                  {quiz.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-base font-bold">Quick actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your learning content moving.
          </p>
          <div className="mt-5 grid gap-2.5">
            {[
              { href: "/dashboard/questions/new", icon: "plus" as const, label: "Add a question" },
              { href: "/dashboard/users", icon: "users" as const, label: "Manage learners" },
              { href: "/dashboard/instructors", icon: "book" as const, label: "Invite an instructor" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-border px-3.5 py-3 text-sm font-semibold transition hover:border-secondary/40 hover:bg-surface-hover"
              >
                <span className="flex items-center gap-3">
                  <Icon name={action.icon} size={17} className="text-secondary-dark" />
                  {action.label}
                </span>
                <Icon name="arrow-right" size={15} className="text-muted" />
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
