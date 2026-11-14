import type { Quiz } from "./learning-platform";

export type QuizAvailabilityState = "available" | "upcoming" | "ended" | "unavailable";

export function getQuizAvailability(
  quiz: Quiz,
  now: Date = new Date(),
): QuizAvailabilityState {
  if (quiz.status !== "published") return "unavailable";
  if (quiz.availability === "always") return "available";
  const startsAt = quiz.availableFrom ? new Date(quiz.availableFrom) : undefined;
  const endsAt = quiz.availableUntil ? new Date(quiz.availableUntil) : undefined;
  if (startsAt && now < startsAt) return "upcoming";
  if (endsAt && now > endsAt) return "ended";
  return "available";
}
