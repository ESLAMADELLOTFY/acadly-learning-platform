"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Question } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";
import { usePortalPermissions } from "@acadly/modules/shared/providers/PermissionContext";
import { Badge, Button, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

export function QuestionBankPage() {
  const permissions = usePortalPermissions();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [subject, setSubject] = useState("all");
  const [type, setType] = useState<"all" | Question["type"]>("all");
  const [error, setError] = useState<string | null>(null);
  const canCreate = hasPermission(permissions, "questions.create");
  const canUpdate = hasPermission(permissions, "questions.update");
  const canDelete = hasPermission(permissions, "questions.delete");

  useEffect(() => {
    let active = true;
    void Promise.all([
      mockLearningPlatform.listQuestions({ search, category, subject, type }),
      mockLearningPlatform.listQuestionFacets(),
    ])
      .then(([questionData, facets]) => {
        if (!active) return;
        setQuestions(questionData);
        setCategories(facets.categories);
        setSubjects(facets.subjects);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Questions could not be loaded.");
        }
      });
    return () => {
      active = false;
    };
  }, [search, category, subject, type]);

  const deleteQuestion = async (question: Question) => {
    if (!window.confirm(`Delete “${question.prompt}”?`)) return;
    try {
      await mockLearningPlatform.deleteQuestion(question.id);
      setQuestions((current) => current.filter((item) => item.id !== question.id));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Question could not be deleted.");
    }
  };

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Content library"
        title="Question bank"
        description="Build and organize reusable questions for your assessments."
        actions={
          canCreate ? (
            <Link
              href="/dashboard/questions/new"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-light"
            >
              <Icon name="plus" size={17} />
              Create question
            </Link>
          ) : null
        }
      />

      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:p-5">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search questions</span>
            <Icon
              name="search"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by question, subject or category"
              className="min-h-10 w-full rounded-xl border border-border bg-input pl-10 pr-3 text-sm outline-none transition placeholder:text-muted focus:border-secondary focus:ring-4 focus:ring-secondary/10"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <label>
              <span className="sr-only">Filter by subject</span>
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="min-h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-label outline-none focus:border-secondary sm:w-auto"
              >
                <option value="all">All subjects</option>
                {subjects.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter by category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="min-h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-label outline-none focus:border-secondary sm:w-auto"
              >
                <option value="all">All categories</option>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="col-span-2 sm:col-span-1">
              <span className="sr-only">Filter by question type</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as typeof type)}
                className="min-h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-label outline-none focus:border-secondary sm:w-auto"
              >
                <option value="all">All types</option>
                <option value="multiple-choice">Multiple choice</option>
                <option value="text">Text response</option>
              </select>
            </label>
          </div>
        </div>
        {error && (
          <div role="alert" className="border-b border-error/20 bg-[#fff4f3] px-5 py-3 text-sm text-error">
            {error}
          </div>
        )}
        {questions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#edf4ee] text-primary">
              <Icon name="search" />
            </span>
            <h2 className="mt-4 font-bold">No questions found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different filter or create a new question.
            </p>
            {canCreate && (
              <Link
                href="/dashboard/questions/new"
                className="mt-4 inline-flex text-sm font-bold text-primary hover:underline"
              >
                Create a question
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#fafbfa] text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Question</th>
                  <th scope="col" className="px-4 py-3.5">Subject</th>
                  <th scope="col" className="px-4 py-3.5">Type</th>
                  <th scope="col" className="px-4 py-3.5">Difficulty</th>
                  <th scope="col" className="px-4 py-3.5">Marks</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {questions.map((question) => (
                  <tr key={question.id} className="group transition hover:bg-[#fbfcfb]">
                    <td className="max-w-[420px] px-5 py-4">
                      <p className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                        {question.prompt}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {question.category} · Updated {new Date(question.updatedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-label">{question.subject}</td>
                    <td className="px-4 py-4">
                      <Badge tone={question.type === "multiple-choice" ? "info" : "neutral"}>
                        {question.type === "multiple-choice" ? "Multiple choice" : "Text"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-label">{question.difficulty}</td>
                    <td className="px-4 py-4 text-sm font-semibold">{question.marks}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        {canUpdate && (
                          <Link
                            href={`/dashboard/questions/${question.id}`}
                            aria-label={`Edit question: ${question.prompt}`}
                            className="rounded-lg p-2 text-muted transition hover:bg-[#edf4ee] hover:text-primary"
                          >
                            <Icon name="edit" size={16} />
                          </Link>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete question: ${question.prompt}`}
                            className="px-2 text-muted hover:bg-[#fff1ef] hover:text-error"
                            onClick={() => void deleteQuestion(question)}
                          >
                            <Icon name="close" size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-border px-5 py-3 text-xs text-muted">
          Showing {questions.length} questions
        </div>
      </Card>
    </div>
  );
}
