"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  Quiz,
  QuizSubmission,
  StudentDashboardData,
} from "@acadly/modules/shared/models/learning-platform";
import { getQuizAvailability } from "@acadly/modules/shared/models/quiz-availability";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import api from "@acadly/infrastructure/apis/api";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Icon } from "@acadly/infrastructure/components/common";
import { useGetUser } from "@acadly/infrastructure/hooks/get_user.hook";

export function StudentDashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading, error: userError } = useGetUser();
  const [overview, setOverview] = useState<StudentDashboardData | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setSignOutError(null);
    setIsSigningOut(true);

    try {
      await api.post("/auth/logout");
      router.replace("/signin");
      router.refresh();
    } catch (cause) {
      setSignOutError(
        cause instanceof Error
          ? cause.message
          : "Unable to sign out. Please try again.",
      );
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    let active = true;
    void Promise.all([
      mockLearningPlatform.getStudentDashboard(),
      mockLearningPlatform.listAvailableQuizzes(),
      mockLearningPlatform.listMyResults(),
    ]).then(([dashboard, quizData, results]) => {
      if (!active) return;
      setOverview(dashboard);
      setQuizzes(quizData);
      setSubmissions(results);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Learning data could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="py-16 text-center text-sm text-muted">Loading your learning space…</p>;
  if (error  || !overview) {
    return <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error ?? "Learning data could not be loaded."}</div>;
  }

  const latestQuiz = quizzes.find((quiz) => getQuizAvailability(quiz) === "available");
  const firstName = user?.name.trim().split(/\s+/)[0];
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[26px] bg-[#173c2c] px-6 py-7 text-white sm:px-9 sm:py-9">
        <div className="absolute -right-10 -top-20 size-72 rounded-full bg-[#9dc9a3]/15 blur-3xl" />
        <div className="absolute bottom-0 right-[26%] size-40 rounded-full bg-[#a7c7a6]/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Your learning space</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-[38px]">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">
              Small steps add up. Pick up where you left off or explore something new today.
            </p>
            {!userLoading && userError && (
              <p role="alert" className="mt-3 text-sm text-white/75">
                Sign in to show your account name.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {latestQuiz && (
              <Link
                href={`/dashboard/quizzes/${latestQuiz.id}`}
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#173c2c] transition hover:bg-[#eff5ee]"
              >
                Continue learning <Icon name="arrow-right" size={16} />
              </Link>
            )}
            <Button
              variant="secondary"
              disabled={isSigningOut}
              onClick={() => void signOut()}
            >
              {isSigningOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </div>
        {signOutError && (
          <p role="alert" className="relative mt-3 text-sm text-white">
            {signOutError}
          </p>
        )}
        <div className="relative mt-8 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
            <span className="mr-1.5 text-[#b8d7bd]">●</span>{overview.learningStreak} day learning streak
          </span>
        </div>
      </section>

      <section aria-label="Your learning statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Available quizzes", value: overview.availableQuizCount.toString(), icon: "book" as const, note: "Ready when you are" },
          { label: "Completed", value: overview.completedQuizCount.toString(), icon: "check" as const, note: "Assessment attempts" },
          { label: "Average score", value: `${overview.averageScore}%`, icon: "activity" as const, note: "Across completed quizzes" },
          { label: "Learning streak", value: `${overview.learningStreak} days`, icon: "sparkles" as const, note: "Keep it going" },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
              <Icon name={stat.icon} size={17} className="text-secondary-dark" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="mt-1 text-[11px] text-muted">{stat.note}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold">Ready for your next quiz?</h2>
              <p className="mt-1 text-xs text-muted">A few hand-picked assessments to keep your momentum.</p>
            </div>
            <Link href="/dashboard/quizzes" className="whitespace-nowrap text-xs font-bold text-primary hover:underline">Browse all</Link>
          </div>
          <div className="divide-y divide-border">
            {quizzes.slice(0, 3).map((quiz) => {
              const availability = getQuizAvailability(quiz);
              return (
                <Link
                  key={quiz.id}
                  href={`/dashboard/quizzes/${quiz.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface-hover/70 sm:px-6"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ee] text-primary">
                      <Icon name="book" size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{quiz.title}</span>
                      <span className="mt-1 block text-xs text-muted">{quiz.questionIds.length} questions · {quiz.durationMinutes} min</span>
                    </span>
                  </span>
                  <Badge tone={availability === "available" ? "success" : "warning"} dot>
                    {availability === "available" ? "Available" : "Coming soon"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-bold">Recent results</h2>
              <p className="mt-1 text-xs text-muted">Your latest quiz attempts</p>
            </div>
            <Link href="/dashboard/results" className="text-xs font-bold text-primary hover:underline">See all</Link>
          </div>
          {submissions.slice(0, 3).length ? (
            <div className="divide-y divide-border">
              {submissions.slice(0, 3).map((submission) => {
                const quiz = quizzes.find((item) => item.id === submission.quizId);
                const percent = submission.totalMarks
                  ? Math.round((submission.score / submission.totalMarks) * 100)
                  : 0;
                return (
                  <Link key={submission.id} href={`/dashboard/results/${submission.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-surface-hover/70">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{quiz?.title ?? "Quiz"}</span>
                      <span className="mt-1 block text-xs text-muted">{new Date(submission.submittedAt).toLocaleDateString()}</span>
                    </span>
                    <span className="text-sm font-bold text-primary">{percent}%</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-10 text-center text-xs text-muted">Complete your first quiz to see results here.</div>
          )}
        </Card>
      </section>
    </div>
  );
}
