"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Question, QuizAvailability, QuizStatus } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";
import { usePortalPermissions } from "@acadly/modules/shared/providers/PermissionContext";
import { Badge, Button, Card, Icon, PageHeading, TextField } from "@acadly/infrastructure/components/common";

type QuizEditorProps = {
  quizId?: string;
};

function localDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function QuizEditor({ quizId }: QuizEditorProps) {
  const router = useRouter();
  const permissions = usePortalPermissions();
  const isEditing = Boolean(quizId);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingMarks, setPassingMarks] = useState(1);
  const [availability, setAvailability] = useState<QuizAvailability>("always");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [status, setStatus] = useState<QuizStatus>("draft");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [questionList, quiz] = await Promise.all([
          mockLearningPlatform.listQuestions(),
          quizId ? mockLearningPlatform.getQuiz(quizId) : Promise.resolve(undefined),
        ]);
        if (!active) return;
        if (quizId && !quiz) {
          setError("This quiz could not be found.");
        } else if (quiz) {
          setTitle(quiz.title);
          setDescription(quiz.description);
          setInstructions(quiz.instructions);
          setQuestionIds(quiz.questionIds);
          setDurationMinutes(quiz.durationMinutes);
          setPassingMarks(quiz.passingMarks);
          setAvailability(quiz.availability);
          setAvailableFrom(localDate(quiz.availableFrom));
          setAvailableUntil(localDate(quiz.availableUntil));
          setStatus(quiz.status);
        }
        setQuestions(questionList);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Quiz data could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [quizId]);

  const totalMarks = useMemo(
    () => questions
      .filter((question) => questionIds.includes(question.id))
      .reduce((total, question) => total + question.marks, 0),
    [questions, questionIds],
  );

  const canSave = hasPermission(
    permissions,
    isEditing ? "quizzes.update" : "quizzes.create",
  );
  const canPublish = hasPermission(permissions, "quizzes.publish");

  const toggleQuestion = (questionId: string) => {
    setQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await mockLearningPlatform.saveQuiz({
        id: quizId,
        title,
        description,
        instructions,
        questionIds,
        durationMinutes,
        passingMarks,
        availability,
        availableFrom: availableFrom ? new Date(`${availableFrom}T00:00:00`).toISOString() : undefined,
        availableUntil: availableUntil ? new Date(`${availableUntil}T23:59:00`).toISOString() : undefined,
        status,
      });
      router.push("/dashboard/quizzes");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Quiz could not be saved.");
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-16 text-center text-sm text-muted">Loading quiz editor…</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <PageHeading
        eyebrow="Quiz management"
        title={isEditing ? "Edit quiz" : "Create a quiz"}
        description="Choose questions, set assessment rules, and preview the learner experience before publishing."
        actions={
          <Link
            href="/dashboard/quizzes"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-label hover:bg-surface-hover"
          >
            <Icon name="arrow-left" size={16} /> Back to quizzes
          </Link>
        }
      />
      {error && (
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      <form onSubmit={(event) => void submit(event)} className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="space-y-5">
          <Card className="space-y-4">
            <div>
              <h2 className="text-base font-bold">Quiz details</h2>
              <p className="mt-1 text-xs text-muted">The title and description are shown to learners.</p>
            </div>
            <TextField
              label="Quiz title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Cell Biology Foundations"
              required
            />
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-label">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                required
                placeholder="What will students learn or demonstrate?"
                className="resize-y rounded-xl border border-border bg-input px-3.5 py-3 text-sm font-normal outline-none focus:border-secondary"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-label">
              Instructions
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                rows={3}
                placeholder="Provide guidance for completing the quiz"
                className="resize-y rounded-xl border border-border bg-input px-3.5 py-3 text-sm font-normal outline-none focus:border-secondary"
              />
            </label>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
              <div>
                <h2 className="text-base font-bold">Add questions</h2>
                <p className="mt-1 text-xs text-muted">Select from the reusable question bank.</p>
              </div>
              <Badge tone="info">{questionIds.length} selected · {totalMarks} marks</Badge>
            </div>
            <div className="max-h-[430px] divide-y divide-border overflow-y-auto">
              {questions.map((question) => (
                <label key={question.id} className="flex cursor-pointer items-start gap-3 px-5 py-4 transition hover:bg-surface-hover/70">
                  <input
                    type="checkbox"
                    checked={questionIds.includes(question.id)}
                    onChange={() => toggleQuestion(question.id)}
                    className="mt-1 size-4 rounded accent-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-5">{question.prompt}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {question.subject} · {question.category} · {question.marks} marks
                    </span>
                  </span>
                  <Badge tone={question.type === "multiple-choice" ? "info" : "neutral"}>
                    {question.type === "multiple-choice" ? "Choice" : "Text"}
                  </Badge>
                </label>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="space-y-4">
            <div>
              <h2 className="text-base font-bold">Assessment settings</h2>
              <p className="mt-1 text-xs text-muted">Configure duration and availability.</p>
            </div>
            <TextField
              label="Duration (minutes)"
              type="number"
              min={1}
              max={240}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
              required
            />
            <TextField
              label={`Passing marks (out of ${totalMarks})`}
              type="number"
              min={0}
              max={Math.max(totalMarks, 0)}
              value={passingMarks}
              onChange={(event) => setPassingMarks(Number(event.target.value))}
              required
            />
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-label">
              Availability
              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value as QuizAvailability)}
                className="min-h-11 rounded-xl border border-border bg-input px-3.5 text-sm outline-none focus:border-secondary"
              >
                <option value="always">Available immediately</option>
                <option value="scheduled">Schedule a date range</option>
              </select>
            </label>
            {availability === "scheduled" && (
              <div className="grid gap-3">
                <TextField
                  label="Available from"
                  type="date"
                  value={availableFrom}
                  onChange={(event) => setAvailableFrom(event.target.value)}
                  required
                />
                <TextField
                  label="Available until"
                  type="date"
                  value={availableUntil}
                  onChange={(event) => setAvailableUntil(event.target.value)}
                  required
                />
              </div>
            )}
          </Card>
          <Card className="space-y-4">
            <div>
              <h2 className="text-base font-bold">Publishing</h2>
              <p className="mt-1 text-xs text-muted">Preview your quiz before making it available.</p>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-label">
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as QuizStatus)}
                className="min-h-11 rounded-xl border border-border bg-input px-3.5 text-sm outline-none focus:border-secondary"
              >
                <option value="draft">Draft</option>
                {canPublish && <option value="published">Published</option>}
                <option value="archived">Archived</option>
              </select>
            </label>
            <Link
              href={quizId ? `/dashboard/quizzes/${quizId}/preview` : "#quiz-preview"}
              onClick={quizId ? undefined : (event) => {
                event.preventDefault();
                setError("Save the quiz as a draft first, then preview it.");
              }}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-semibold text-label hover:bg-surface-hover"
            >
              <Icon name="search" size={16} /> Preview quiz
            </Link>
          </Card>
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={!canSave || saving}>
              {saving ? "Saving…" : isEditing ? "Save changes" : "Save quiz"}
            </Button>
            {!canSave && (
              <p role="status" className="text-center text-xs text-muted">
                You don’t have permission to save quizzes.
              </p>
            )}
            {error && (
              <p role="status" className="text-xs text-error">
                {error}
              </p>
            )}
          </div>
        </aside>
      </form>
    </div>
  );
}
