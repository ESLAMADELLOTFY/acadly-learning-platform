"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentQuizDetails } from "@acadly/modules/shared/models/learning-platform";
import { getQuizAvailability } from "@acadly/modules/shared/models/quiz-availability";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { Badge, Button, Card, Icon, TextField } from "@acadly/infrastructure/components/common";

export function QuizTakingPage({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [details, setDetails] = useState<StudentQuizDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    let active = true;
    void mockLearningPlatform.getStudentQuiz(quizId)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setError("This quiz is not available.");
          return;
        }
        setDetails(data);
        setRemainingSeconds(data.quiz.durationMinutes * 60);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Quiz could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [quizId]);

  const isAvailable = details && getQuizAvailability(details.quiz) === "available";
  const submitAttempt = useCallback(async () => {
    if (!details || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const submission = await mockLearningPlatform.submitQuiz(
        details.quiz.id,
        answers,
      );
      router.push(`/dashboard/results/${submission.id}`);
    } catch (cause) {
      submittingRef.current = false;
      setSubmitting(false);
      setError(cause instanceof Error ? cause.message : "Your answers could not be submitted.");
    }
  }, [answers, details, router]);

  useEffect(() => {
    if (!isAvailable || submitting) return;
    const timerId = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timerId);
          window.setTimeout(() => void submitAttempt(), 0);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [isAvailable, submitAttempt, submitting]);

  const questions = useMemo(() => details?.questions ?? [], [details]);
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.values(answers).filter((answer) => answer.trim()).length;
  const totalMarks = useMemo(
    () => questions.reduce((total, question) => total + question.marks, 0),
    [questions],
  );
  const timeLabel = `${Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(remainingSeconds % 60).toString().padStart(2, "0")}`;

  if (loading) return <p className="py-16 text-center text-sm text-muted">Preparing your quiz…</p>;
  if (!details) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/quizzes" className="text-sm font-semibold text-primary hover:underline">Back to quizzes</Link>
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error ?? "Quiz not found."}</div>
      </div>
    );
  }
  if (!isAvailable) {
    return (
      <Card className="mx-auto max-w-xl py-10 text-center">
        <Icon name="clock" size={26} className="mx-auto text-muted" />
        <h1 className="mt-4 text-xl font-bold">This quiz isn’t open yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You can take this assessment when it becomes available.
        </p>
        <Link href={`/dashboard/quizzes/${details.quiz.id}`} className="mt-5 inline-flex text-sm font-bold text-primary hover:underline">
          View quiz details
        </Link>
      </Card>
    );
  }

  const setAnswer = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
  };

  const requestSubmit = () => {
    const unanswered = questions.length - answeredCount;
    if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Submit anyway?`)) {
      return;
    }
    void submitAttempt();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <Link href={`/dashboard/quizzes/${details.quiz.id}`} className="text-xs font-semibold text-muted hover:text-primary">
            {details.quiz.title}
          </Link>
          <p className="mt-1 text-sm font-bold">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted sm:inline">{answeredCount} of {questions.length} answered</span>
          <div
            aria-label={`Time remaining: ${timeLabel}`}
            aria-live="polite"
            className={`inline-flex min-w-[92px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold tabular-nums ${
              remainingSeconds <= 60 ? "bg-[#fff0ee] text-error" : "bg-[#edf4ee] text-primary"
            }`}
          >
            <Icon name="clock" size={16} /> {timeLabel}
          </div>
          <Button size="sm" onClick={requestSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit quiz"}
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_230px]">
        <Card className="min-h-[420px]">
          {currentQuestion && (
            <div className="mx-auto max-w-2xl py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="info">
                  {currentQuestion.type === "multiple-choice" ? "Multiple choice" : "Written response"}
                </Badge>
                <span className="text-xs font-semibold text-muted">{currentQuestion.marks} marks</span>
              </div>
              <h1 className="mt-6 text-xl font-bold leading-8 sm:text-2xl">{currentQuestion.prompt}</h1>
              {currentQuestion.type === "multiple-choice" ? (
                <fieldset className="mt-7 space-y-3">
                  <legend className="sr-only">Choose one answer</legend>
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                        answers[currentQuestion.id] === option.id
                          ? "border-primary bg-[#edf4ee] ring-1 ring-primary"
                          : "border-border hover:border-secondary/50 hover:bg-[#fbfcfb]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option.id}
                        checked={answers[currentQuestion.id] === option.id}
                        onChange={() => setAnswer(option.id)}
                        className="size-4 accent-primary"
                      />
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f0f3f0] text-xs font-bold text-muted">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm font-medium">{option.text}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <div className="mt-7">
                  <TextField
                    label="Your answer"
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Type your response"
                    hint="Take your time and write a clear answer."
                    autoComplete="off"
                  />
                </div>
              )}
              <div className="mt-9 flex items-center justify-between border-t border-border pt-5">
                <Button
                  variant="secondary"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                >
                  <Icon name="arrow-left" size={15} /> Previous
                </Button>
                {currentIndex < questions.length - 1 ? (
                  <Button onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}>
                    Next question <Icon name="arrow-right" size={15} />
                  </Button>
                ) : (
                  <Button onClick={requestSubmit} disabled={submitting}>
                    Finish quiz <Icon name="check" size={15} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card padding="md" className="h-fit">
          <h2 className="text-sm font-bold">Question overview</h2>
          <p className="mt-1 text-xs text-muted">Select a number to move through the quiz.</p>
          <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-4">
            {questions.map((question, index) => {
              const isAnswered = Boolean(answers[question.id]?.trim());
              return (
                <button
                  key={question.id}
                  type="button"
                  aria-label={`Go to question ${index + 1}${isAnswered ? ", answered" : ", unanswered"}`}
                  aria-current={index === currentIndex ? "step" : undefined}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex size-9 items-center justify-center rounded-lg border text-xs font-bold transition ${
                    index === currentIndex
                      ? "border-primary bg-primary text-white"
                      : isAnswered
                        ? "border-[#c9dfce] bg-[#edf4ee] text-primary"
                        : "border-border bg-white text-muted hover:border-secondary"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Progress</span>
              <span className="font-bold">{answeredCount}/{questions.length}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf0ed]">
              <span
                className="block h-full rounded-full bg-primary transition-all"
                style={{ width: `${questions.length ? answeredCount / questions.length * 100 : 0}%` }}
              />
            </div>
            <p className="mt-4 text-[11px] leading-5 text-muted">
              You have {totalMarks} marks available. Your answers submit automatically when the timer ends.
            </p>
          </div>
        </Card>
      </div>
      {error && <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>}
    </div>
  );
}
