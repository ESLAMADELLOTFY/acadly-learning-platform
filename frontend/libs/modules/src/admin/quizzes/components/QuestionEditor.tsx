"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  Question,
  QuestionDifficulty,
  QuestionInput,
} from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";
import { usePortalPermissions } from "@acadly/modules/shared/providers/PermissionContext";
import { Button, Card, Icon, PageHeading, TextField } from "@acadly/infrastructure/components/common";

type QuestionEditorProps = {
  questionId?: string;
};

const initialOptions = [
  { id: "option-a", text: "" },
  { id: "option-b", text: "" },
];

export function QuestionEditor({ questionId }: QuestionEditorProps) {
  const router = useRouter();
  const permissions = usePortalPermissions();
  const isEditing = Boolean(questionId);
  const canCreate = hasPermission(permissions, "questions.create");
  const canUpdate = hasPermission(permissions, "questions.update");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [explanation, setExplanation] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [marks, setMarks] = useState(1);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("Medium");
  const [type, setType] = useState<Question["type"]>("multiple-choice");
  const [options, setOptions] = useState(initialOptions);
  const [correctOptionId, setCorrectOptionId] = useState("option-a");
  const [acceptedAnswers, setAcceptedAnswers] = useState("");

  useEffect(() => {
    if (!questionId) return;
    let active = true;
    void mockLearningPlatform.getQuestion(questionId).then((question) => {
      if (!active) return;
      if (!question) {
        setError("This question could not be found.");
        setLoading(false);
        return;
      }
      setPrompt(question.prompt);
      setExplanation(question.explanation);
      setSubject(question.subject);
      setCategory(question.category);
      setMarks(question.marks);
      setDifficulty(question.difficulty);
      setType(question.type);
      if (question.type === "multiple-choice") {
        setOptions(question.options);
        setCorrectOptionId(question.correctOptionId);
      } else {
        setAcceptedAnswers(question.acceptedAnswers.join(", "));
      }
      setLoading(false);
    }).catch((cause: unknown) => {
      if (active) {
        setError(cause instanceof Error ? cause.message : "Question could not be loaded.");
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [questionId]);

  const updateOption = (id: string, text: string) => {
    setOptions((current) => current.map((option) => option.id === id ? { ...option, text } : option));
  };

  const addOption = () => {
    const id = `option-${Date.now()}`;
    setOptions((current) => [...current, { id, text: "" }]);
  };

  const removeOption = (id: string) => {
    setOptions((current) => current.filter((option) => option.id !== id));
    if (correctOptionId === id) {
      setCorrectOptionId(options.find((option) => option.id !== id)?.id ?? "");
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const input: QuestionInput = {
      id: questionId,
      prompt,
      explanation,
      subject,
      category,
      marks,
      difficulty,
      type,
      ...(type === "multiple-choice"
        ? { options, correctOptionId }
        : { acceptedAnswers: acceptedAnswers.split(",") }),
    };
    try {
      await mockLearningPlatform.saveQuestion(input);
      router.push("/dashboard/questions");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Question could not be saved.");
      setSaving(false);
    }
  };

  const canSave = isEditing ? canUpdate : canCreate;

  if (loading) {
    return <p className="py-16 text-center text-sm text-muted">Loading question…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <PageHeading
        eyebrow="Question bank"
        title={isEditing ? "Edit question" : "Create a question"}
        description="Write a clear prompt, choose the response format, and set its value."
        actions={
          <Link
            href="/dashboard/questions"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-label hover:bg-surface-hover"
          >
            <Icon name="arrow-left" size={16} /> Back to bank
          </Link>
        }
      />

      {error && (
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={(event) => void submit(event)} className="space-y-5">
        <Card className="space-y-5">
          <TextField
            label="Question prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Write the question students will answer"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Biology"
              required
            />
            <TextField
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Cell biology"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-label">
              Question type
              <select
                value={type}
                onChange={(event) => setType(event.target.value as Question["type"])}
                className="min-h-11 rounded-xl border border-border bg-input px-3.5 text-sm outline-none focus:border-secondary"
              >
                <option value="multiple-choice">Multiple choice</option>
                <option value="text">Text response</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-label">
              Difficulty
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as QuestionDifficulty)}
                className="min-h-11 rounded-xl border border-border bg-input px-3.5 text-sm outline-none focus:border-secondary"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
            <TextField
              label="Marks"
              type="number"
              min={1}
              max={100}
              value={marks}
              onChange={(event) => setMarks(Number(event.target.value))}
              required
            />
          </div>
        </Card>

        <Card className="space-y-4">
          {type === "multiple-choice" ? (
            <>
              <div>
                <h2 className="text-sm font-bold">Answer options</h2>
                <p className="mt-1 text-xs text-muted">
                  Add at least two options, then mark the correct answer.
                </p>
              </div>
              <div className="space-y-2.5">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-answer"
                      aria-label={`Mark option ${index + 1} as correct`}
                      checked={correctOptionId === option.id}
                      onChange={() => setCorrectOptionId(option.id)}
                      className="size-4 accent-primary"
                    />
                    <input
                      value={option.text}
                      onChange={(event) => updateOption(option.id, event.target.value)}
                      placeholder={`Option ${index + 1}`}
                      aria-label={`Option ${index + 1}`}
                      required
                      className="min-h-10 min-w-0 flex-1 rounded-xl border border-border bg-input px-3 text-sm outline-none focus:border-secondary"
                    />
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove option ${index + 1}`}
                        className="px-2 text-muted"
                        onClick={() => removeOption(option.id)}
                      >
                        <Icon name="close" size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={addOption}>
                <Icon name="plus" size={15} /> Add option
              </Button>
            </>
          ) : (
            <TextField
              label="Accepted answers"
              value={acceptedAnswers}
              onChange={(event) => setAcceptedAnswers(event.target.value)}
              placeholder="Separate accepted answers with commas"
              hint="Answers are matched without case sensitivity."
              required
            />
          )}
        </Card>

        <Card>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-label">
            Explanation (optional)
            <textarea
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              rows={3}
              placeholder="Add context or an explanation shown after the quiz"
              className="resize-y rounded-xl border border-border bg-input px-3.5 py-3 text-sm font-normal outline-none focus:border-secondary"
            />
          </label>
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          <Link
            href="/dashboard/questions"
            className="inline-flex min-h-10 items-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-label hover:bg-surface-hover"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={!canSave || saving}>
            {saving ? "Saving…" : isEditing ? "Save changes" : "Save question"}
          </Button>
        </div>
        {!canSave && (
          <p role="status" className="text-right text-xs text-muted">
            You don’t have permission to save questions.
          </p>
        )}
      </form>
    </div>
  );
}
