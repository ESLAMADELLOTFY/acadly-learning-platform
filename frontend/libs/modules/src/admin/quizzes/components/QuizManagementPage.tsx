"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Quiz } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";
import { usePortalPermissions } from "@acadly/modules/shared/providers/PermissionContext";
import { Badge, Button, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

export function QuizManagementPage() {
  const permissions = usePortalPermissions();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filter, setFilter] = useState<"all" | Quiz["status"]>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const canCreate = hasPermission(permissions, "quizzes.create");
  const canUpdate = hasPermission(permissions, "quizzes.update");
  const canPublish = hasPermission(permissions, "quizzes.publish");

  useEffect(() => {
    let active = true;
    void mockLearningPlatform.listQuizzes()
      .then((data) => {
        if (active) {
          setQuizzes(data);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Quizzes could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const changeStatus = async (quiz: Quiz) => {
    const status = quiz.status === "published" ? "draft" : "published";
    try {
      await mockLearningPlatform.setQuizStatus(quiz.id, status);
      const data = await mockLearningPlatform.listQuizzes();
      setQuizzes(data);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Quiz status could not be changed.");
    }
  };

  const filtered = quizzes.filter((quiz) => filter === "all" || quiz.status === filter);

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Assessment workspace"
        title="Quiz management"
        description="Build assessments from your question bank and manage when learners can take them."
        actions={
          canCreate ? (
            <Link
              href="/dashboard/quizzes/new"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-light"
            >
              <Icon name="plus" size={17} /> Create quiz
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-border bg-white p-1">
          {(["all", "published", "draft", "archived"] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
                filter === status ? "bg-[#edf4ee] text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              {status === "all" ? "All quizzes" : status}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">{filtered.length} assessments</p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      {loading ? (
        <p className="py-16 text-center text-sm text-muted">Loading quizzes…</p>
      ) : filtered.length === 0 ? (
        <Card className="py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#edf4ee] text-primary">
            <Icon name="grid" />
          </span>
          <h2 className="mt-4 font-bold">No quizzes in this view</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an assessment or choose another status.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#edf4ee] text-primary">
                  <Icon name="book" size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold">{quiz.title}</h2>
                    <Badge tone={quiz.status === "published" ? "success" : quiz.status === "draft" ? "neutral" : "warning"} dot>
                      {quiz.status}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {quiz.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="book" size={14} /> {quiz.questionIds.length} questions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="clock" size={14} /> {quiz.durationMinutes} min
                </span>
                <span>{quiz.passingMarks} pass marks</span>
                <span>{quiz.attemptsCount} attempts</span>
              </div>
              {quiz.availability === "scheduled" && (
                <p className="text-xs text-muted">
                  Scheduled {quiz.availableFrom ? `from ${new Date(quiz.availableFrom).toLocaleDateString()}` : ""}
                  {quiz.availableUntil ? ` until ${new Date(quiz.availableUntil).toLocaleDateString()}` : ""}
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <Link
                  href={`/dashboard/quizzes/${quiz.id}/preview`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-label hover:bg-surface-hover"
                >
                  <Icon name="search" size={15} /> Preview
                </Link>
                {canUpdate && (
                  <Link
                    href={`/dashboard/quizzes/${quiz.id}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-label hover:bg-surface-hover"
                  >
                    <Icon name="edit" size={15} /> Edit
                  </Link>
                )}
                {((quiz.status === "published" && canUpdate) || (quiz.status !== "published" && canPublish)) && (
                  <Button
                    variant={quiz.status === "published" ? "ghost" : "secondary"}
                    size="sm"
                    className="ml-auto"
                    onClick={() => void changeStatus(quiz)}
                  >
                    {quiz.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
