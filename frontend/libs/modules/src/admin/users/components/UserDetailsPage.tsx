"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PlatformUser, Quiz, QuizSubmission, RoleDefinition } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { Badge, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

export function UserDetailsPage({ userId }: { userId: string }) {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [role, setRole] = useState<RoleDefinition | null>(null);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.all([
      mockLearningPlatform.listUsers(),
      mockLearningPlatform.listRoles(),
      mockLearningPlatform.listSubmissions(),
      mockLearningPlatform.listQuizzes(),
    ]).then(([users, roles, allSubmissions, allQuizzes]) => {
      if (!active) return;
      const selectedUser = users.find((item) => item.id === userId);
      if (!selectedUser) {
        setError("This user could not be found.");
      } else {
        setUser(selectedUser);
        setRole(roles.find((item) => item.id === selectedUser.roleId) ?? null);
        setSubmissions(allSubmissions.filter((item) => item.userId === selectedUser.id));
        setQuizzes(allQuizzes);
      }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "User details could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) return <p className="py-16 text-center text-sm text-muted">Loading user profile…</p>;
  if (!user) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/users" className="text-sm font-semibold text-primary hover:underline">Back to users</Link>
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error ?? "User not found."}</div>
      </div>
    );
  }
  const average = submissions.length
    ? Math.round(submissions.reduce((total, item) => total + item.score / item.totalMarks * 100, 0) / submissions.length)
    : 0;

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="User profile"
        title={user.name}
        description={user.email}
        actions={
          <Link href="/dashboard/users" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-label hover:bg-surface-hover">
            <Icon name="arrow-left" size={16} /> All users
          </Link>
        }
      />
      <section className="grid gap-4 sm:grid-cols-3">
        <Card padding="sm">
          <p className="text-xs font-medium text-muted">Account status</p>
          <div className="mt-3"><Badge tone={user.status === "active" ? "success" : "neutral"} dot>{user.status}</Badge></div>
        </Card>
        <Card padding="sm">
          <p className="text-xs font-medium text-muted">Platform role</p>
          <p className="mt-2 text-sm font-bold">{role?.name ?? "Unassigned"}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs font-medium text-muted">Joined platform</p>
          <p className="mt-2 text-sm font-bold">{new Date(user.joinedAt).toLocaleDateString()}</p>
        </Card>
      </section>
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-bold">Quiz history</h2>
            <p className="mt-1 text-xs text-muted">Previous assessment attempts</p>
          </div>
          {submissions.length ? (
            <div className="divide-y divide-border">
              {submissions.map((submission) => {
                const quiz = quizzes.find((item) => item.id === submission.quizId);
                return (
                  <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold">{quiz?.title ?? "Quiz"}</p>
                      <p className="mt-1 text-xs text-muted">{new Date(submission.submittedAt).toLocaleString()} · Attempt {submission.attemptNumber}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{submission.score}/{submission.totalMarks}</span>
                      <Badge tone={submission.status === "reviewed" ? "success" : "warning"}>{submission.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted">No quiz submissions yet.</p>
          )}
        </Card>
        <Card>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#edf4ee] text-primary"><Icon name="activity" /></div>
          <h2 className="mt-4 font-bold">Learning progress</h2>
          <p className="mt-1 text-sm text-muted-foreground">A snapshot of this learner’s activity.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#f7f8f6] p-3">
              <p className="text-xs text-muted">Completed</p>
              <p className="mt-1 text-xl font-bold">{user.completedQuizCount}</p>
            </div>
            <div className="rounded-xl bg-[#f7f8f6] p-3">
              <p className="text-xs text-muted">Average</p>
              <p className="mt-1 text-xl font-bold">{submissions.length ? `${average}%` : "—"}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Last active {new Date(user.lastActiveAt).toLocaleString()}</p>
        </Card>
      </section>
    </div>
  );
}
