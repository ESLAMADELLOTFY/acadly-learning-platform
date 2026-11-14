"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Quiz } from "@acadly/modules/shared/models/learning-platform";
import { getQuizAvailability } from "@acadly/modules/shared/models/quiz-availability";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { Badge, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

export function AvailableQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "available" | "upcoming">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void mockLearningPlatform.listAvailableQuizzes()
      .then((data) => {
        if (active) setQuizzes(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Quizzes could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return quizzes.filter((quiz) => {
      const state = getQuizAvailability(quiz);
      const matchesStatus = status === "all" || state === status;
      const matchesSearch = !query || `${quiz.title} ${quiz.description}`.toLocaleLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [quizzes, search, status]);

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Keep growing"
        title="Explore quizzes"
        description="Find a short assessment to practice your skills and see how far you’ve come."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search quizzes</span>
          <Icon name="search" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search quizzes"
            className="min-h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm outline-none focus:border-secondary"
          />
        </label>
        <div className="inline-flex rounded-xl border border-border bg-white p-1">
          {(["all", "available", "upcoming"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={status === filter}
              onClick={() => setStatus(filter)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${
                status === filter ? "bg-[#edf4ee] text-primary" : "text-muted"
              }`}
            >
              {filter === "all" ? "All quizzes" : filter}
            </button>
          ))}
        </div>
      </div>
      {error && <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>}
      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((quiz) => {
            const availability = getQuizAvailability(quiz);
            return (
              <Card key={quiz.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#edf4ee] text-primary">
                    <Icon name="book" size={19} />
                  </span>
                  <Badge tone={availability === "available" ? "success" : "warning"} dot>
                    {availability === "available" ? "Available now" : "Coming soon"}
                  </Badge>
                </div>
                <h2 className="mt-5 text-lg font-bold leading-6">{quiz.title}</h2>
                <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-muted-foreground">
                  {quiz.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 border-y border-border py-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Icon name="clock" size={14} />{quiz.durationMinutes} min</span>
                  <span>·</span>
                  <span>{quiz.questionIds.length} questions</span>
                  <span>·</span>
                  <span>{quiz.passingMarks} pass marks</span>
                </div>
                {availability === "upcoming" && quiz.availableFrom && (
                  <p className="mt-3 text-xs text-muted">
                    Opens {new Date(quiz.availableFrom).toLocaleDateString()}
                  </p>
                )}
                <Link
                  href={`/dashboard/quizzes/${quiz.id}`}
                  className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border text-sm font-semibold text-primary transition hover:bg-[#edf4ee]"
                >
                  View quiz <Icon name="arrow-right" size={15} />
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-16 text-center">
          <Icon name="search" size={24} className="mx-auto text-muted" />
          <h2 className="mt-3 font-bold">No quizzes found</h2>
          <p className="mt-1 text-sm text-muted">Try another search or availability filter.</p>
        </Card>
      )}
    </div>
  );
}
