export type UserId = string;
export type QuestionId = string;
export type QuizId = string;
export type SubmissionId = string;
export type RoleId = string;

export type PermissionKey =
  | "dashboard.view"
  | "questions.view"
  | "questions.create"
  | "questions.update"
  | "questions.delete"
  | "quizzes.view"
  | "quizzes.create"
  | "quizzes.update"
  | "quizzes.publish"
  | "users.view"
  | "users.manage"
  | "creators.view"
  | "creators.manage"
  | "roles.view"
  | "roles.manage"
  | "submissions.view"
  | "submissions.review"
  | "settings.manage"
  | "learning.dashboard.view"
  | "learning.quizzes.view"
  | "learning.quizzes.take"
  | "learning.results.view"
  | "profile.manage";

export type AccountStatus = "active" | "inactive" | "invited";
export type PlatformRoleName =
  | "Super Admin"
  | "Admin"
  | "Instructor / Content Creator"
  | "User / Student";

export interface PlatformUser {
  id: UserId;
  name: string;
  email: string;
  roleId: RoleId;
  status: AccountStatus;
  joinedAt: string;
  lastActiveAt: string;
  completedQuizCount: number;
  averageScore: number;
  subject?: string;
}

export interface RoleDefinition {
  id: RoleId;
  name: PlatformRoleName;
  description: string;
  permissions: PermissionKey[];
  memberCount: number;
  system: boolean;
  permissionsLocked?: boolean;
}

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

interface BaseQuestion {
  id: QuestionId;
  prompt: string;
  explanation: string;
  marks: number;
  category: string;
  subject: string;
  difficulty: QuestionDifficulty;
  createdBy: UserId;
  updatedAt: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice";
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
  acceptedAnswers: string[];
}

export type Question = MultipleChoiceQuestion | TextQuestion;

export type QuizStatus = "draft" | "published" | "archived";
export type QuizAvailability = "always" | "scheduled";

export interface Quiz {
  id: QuizId;
  title: string;
  description: string;
  instructions: string;
  questionIds: QuestionId[];
  durationMinutes: number;
  passingMarks: number;
  status: QuizStatus;
  availability: QuizAvailability;
  availableFrom?: string;
  availableUntil?: string;
  createdBy: UserId;
  updatedAt: string;
  attemptsCount: number;
  averageScore: number;
}

export type SubmissionStatus = "submitted" | "needs-review" | "reviewed";

export interface SubmissionAnswer {
  questionId: QuestionId;
  answer: string;
  awardedMarks?: number;
  feedback?: string;
}

export interface QuizSubmission {
  id: SubmissionId;
  quizId: QuizId;
  userId: UserId;
  submittedAt: string;
  score: number;
  totalMarks: number;
  status: SubmissionStatus;
  answers: SubmissionAnswer[];
  attemptNumber: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  kind: "quiz" | "question" | "user" | "submission";
}

export interface AdminDashboardData {
  totalUsers: number;
  totalQuestions: number;
  totalQuizzes: number;
  activeQuizzes: number;
  averageScore: number;
  completionRate: number;
  weeklySubmissions: { day: string; submissions: number }[];
  recentActivity: ActivityItem[];
}

export interface StudentDashboardData {
  availableQuizCount: number;
  completedQuizCount: number;
  averageScore: number;
  learningStreak: number;
  recentActivity: ActivityItem[];
  recentSubmissions: QuizSubmission[];
}

export interface QuestionFilters {
  search?: string;
  category?: string;
  subject?: string;
  type?: Question["type"] | "all";
}

export interface UserFilters {
  search?: string;
  status?: AccountStatus | "all";
  roleId?: RoleId | "all";
}

export interface QuestionInput {
  id?: QuestionId;
  prompt: string;
  explanation: string;
  marks: number;
  category: string;
  subject: string;
  difficulty: QuestionDifficulty;
  type: Question["type"];
  options?: { id: string; text: string }[];
  correctOptionId?: string;
  acceptedAnswers?: string[];
}

export interface QuizInput {
  id?: QuizId;
  title: string;
  description: string;
  instructions: string;
  questionIds: QuestionId[];
  durationMinutes: number;
  passingMarks: number;
  availability: QuizAvailability;
  availableFrom?: string;
  availableUntil?: string;
  status: QuizStatus;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  defaultQuizDuration: number;
  allowRetakes: boolean;
  showCorrectAnswers: boolean;
}

export interface ProfileInput {
  name: string;
  email: string;
}

export interface CreatorInviteInput extends ProfileInput {
  subject: string;
}

export type StudentQuestion =
  | Omit<MultipleChoiceQuestion, "correctOptionId" | "explanation">
  | Omit<TextQuestion, "acceptedAnswers" | "explanation">;

export interface StudentQuizDetails {
  quiz: Quiz;
  questions: StudentQuestion[];
}

export interface StudentSubmissionDetails {
  submission: QuizSubmission;
  quiz: Quiz;
  questions: StudentQuestion[];
}
