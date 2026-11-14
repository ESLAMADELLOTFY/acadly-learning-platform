import {
  mockActivity,
  mockPlatformSettings,
  mockQuestions,
  mockQuizzes,
  mockRoles,
  mockSubmissions,
  mockUsers,
} from "@acadly/modules/shared/data/mock/learning-platform";
import type {
  AccountStatus,
  CreatorInviteInput,
  PlatformSettings,
  PlatformUser,
  ProfileInput,
  Question,
  QuestionFilters,
  QuestionInput,
  Quiz,
  QuizSubmission,
  RoleDefinition,
  StudentQuestion,
  StudentSubmissionDetails,
  SubmissionAnswer,
  SubmissionStatus,
  UserFilters,
} from "@acadly/modules/shared/models/learning-platform";
import type { PermissionKey } from "@acadly/modules/shared/models/learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";
import { getQuizAvailability } from "@acadly/modules/shared/models/quiz-availability";
import type {
  LearningPlatformService,
  PortalContext,
} from "./contracts";

const ADMIN_USER_ID = "usr-admin";
const STUDENT_USER_ID = "usr-student-1";
const INSTRUCTOR_ROLE_ID = "role-instructor";

let questions = [...mockQuestions];
let quizzes = [...mockQuizzes];
let users = [...mockUsers];
let roles = [...mockRoles];
let submissions = [...mockSubmissions];
let settings = { ...mockPlatformSettings };
const creatorPermissionOverrides = new Map<string, PermissionKey[]>();

function requirePermission(
  context: PortalContext,
  permission: PermissionKey,
): void {
  if (!hasPermission(context.permissions, permission)) {
    throw new Error("You do not have permission to perform this action.");
  }
}

function findUser(id: string): PlatformUser {
  const user = users.find((item) => item.id === id);
  if (!user) throw new Error("The requested user could not be found.");
  return user;
}

function findRole(id: string): RoleDefinition {
  const role = roles.find((item) => item.id === id);
  if (!role) throw new Error("The requested role could not be found.");
  return role;
}

function findQuiz(id: string): Quiz {
  const quiz = quizzes.find((item) => item.id === id);
  if (!quiz) throw new Error("The requested quiz could not be found.");
  return quiz;
}

function findSubmission(id: string): QuizSubmission {
  const submission = submissions.find((item) => item.id === id);
  if (!submission) throw new Error("The requested submission could not be found.");
  return submission;
}

function contextForUser(userId: string): PortalContext {
  const user = findUser(userId);
  const role = findRole(user.roleId);
  const permissions = creatorPermissionOverrides.get(userId) ?? role.permissions;
  return { user, permissions: [...permissions] };
}

function questionTotalMarks(questionIds: string[]): number {
  return questionIds.reduce((total, id) => {
    const question = questions.find((item) => item.id === id);
    if (!question) throw new Error(`Question ${id} is no longer available.`);
    return total + question.marks;
  }, 0);
}

function normalizeText(answer: string): string {
  return answer.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function scoreAnswers(
  questionList: Question[],
  answerMap: Record<string, string>,
): { score: number; answers: SubmissionAnswer[]; needsReview: boolean } {
  let score = 0;
  let needsReview = false;
  const answers = questionList.map((question) => {
    const answer = answerMap[question.id] ?? "";
    if (question.type === "multiple-choice") {
      const awardedMarks = answer === question.correctOptionId ? question.marks : 0;
      score += awardedMarks;
      return { questionId: question.id, answer, awardedMarks };
    }

    const accepted = question.acceptedAnswers.map(normalizeText);
    const isCorrect = accepted.includes(normalizeText(answer));
    if (!answer.trim()) {
      return { questionId: question.id, answer, awardedMarks: 0 };
    }
    if (isCorrect) {
      score += question.marks;
      return { questionId: question.id, answer, awardedMarks: question.marks };
    }

    needsReview = true;
    return { questionId: question.id, answer };
  });
  return { score, answers, needsReview };
}

function makeQuestion(input: QuestionInput, id: string): Question {
  const base = {
    id,
    prompt: input.prompt.trim(),
    explanation: input.explanation.trim(),
    marks: input.marks,
    category: input.category.trim(),
    subject: input.subject.trim(),
    difficulty: input.difficulty,
    createdBy: ADMIN_USER_ID,
    updatedAt: new Date().toISOString(),
  };
  if (input.type === "multiple-choice") {
    const options = (input.options ?? [])
      .filter((option) => option.text.trim())
      .map((option) => ({ ...option, text: option.text.trim() }));
    if (options.length < 2) throw new Error("Add at least two answer options.");
    const correctOptionId = input.correctOptionId;
    if (!correctOptionId || !options.some((option) => option.id === correctOptionId)) {
      throw new Error("Choose a correct answer option.");
    }
    return { ...base, type: "multiple-choice", options, correctOptionId };
  }

  const acceptedAnswers = (input.acceptedAnswers ?? [])
    .map((answer) => answer.trim())
    .filter(Boolean);
  if (acceptedAnswers.length === 0) {
    throw new Error("Add at least one accepted answer.");
  }
  return { ...base, type: "text", acceptedAnswers };
}

function getQuizQuestions(ids: string[]): Question[] {
  return ids.map((id) => {
    const question = questions.find((item) => item.id === id);
    if (!question) throw new Error(`Question ${id} is no longer available.`);
    return question;
  });
}

function redactStudentQuestion(question: Question): StudentQuestion {
  if (question.type === "multiple-choice") {
    return {
      id: question.id,
      prompt: question.prompt,
      marks: question.marks,
      category: question.category,
      subject: question.subject,
      difficulty: question.difficulty,
      createdBy: question.createdBy,
      updatedAt: question.updatedAt,
      type: question.type,
      options: question.options,
    };
  }
  return {
    id: question.id,
    prompt: question.prompt,
    marks: question.marks,
    category: question.category,
    subject: question.subject,
    difficulty: question.difficulty,
    createdBy: question.createdBy,
    updatedAt: question.updatedAt,
    type: question.type,
  };
}

export const mockLearningPlatform: LearningPlatformService = {
  async getAdminContext() {
    return contextForUser(ADMIN_USER_ID);
  },
  async getStudentContext() {
    return contextForUser(STUDENT_USER_ID);
  },
  async getAdminDashboard() {
    requirePermission(contextForUser(ADMIN_USER_ID), "dashboard.view");
    const reviewedSubmissions = submissions.filter(
      (submission) => submission.status === "reviewed",
    );
    const averageScore =
      reviewedSubmissions.length === 0
        ? 0
        : Math.round(
            reviewedSubmissions.reduce(
              (total, submission) =>
                total + (submission.score / submission.totalMarks) * 100,
              0,
            ) / reviewedSubmissions.length,
          );
    return {
      totalUsers: users.length,
      totalQuestions: questions.length,
      totalQuizzes: quizzes.length,
      activeQuizzes: quizzes.filter((quiz) => quiz.status === "published").length,
      averageScore,
      completionRate: 84,
      weeklySubmissions: [
        { day: "Mon", submissions: 15 },
        { day: "Tue", submissions: 22 },
        { day: "Wed", submissions: 18 },
        { day: "Thu", submissions: 31 },
        { day: "Fri", submissions: 24 },
        { day: "Sat", submissions: 13 },
        { day: "Sun", submissions: 19 },
      ],
      recentActivity: [...mockActivity],
    };
  },
  async listQuestions(filters: QuestionFilters = {}) {
    requirePermission(contextForUser(ADMIN_USER_ID), "questions.view");
    const search = filters.search?.trim().toLocaleLowerCase() ?? "";
    return questions.filter((question) => {
      const matchesSearch =
        !search ||
        [question.prompt, question.subject, question.category].some((value) =>
          value.toLocaleLowerCase().includes(search),
        );
      const matchesType =
        !filters.type || filters.type === "all" || question.type === filters.type;
      const matchesCategory =
        !filters.category ||
        filters.category === "all" ||
        question.category === filters.category;
      const matchesSubject =
        !filters.subject ||
        filters.subject === "all" ||
        question.subject === filters.subject;
      return matchesSearch && matchesType && matchesCategory && matchesSubject;
    });
  },
  async getQuestion(id) {
    requirePermission(contextForUser(ADMIN_USER_ID), "questions.view");
    return questions.find((question) => question.id === id);
  },
  async saveQuestion(input) {
    const context = contextForUser(ADMIN_USER_ID);
    requirePermission(context, input.id ? "questions.update" : "questions.create");
    if (input.id) {
      const existing = questions.find((question) => question.id === input.id);
      if (!existing) throw new Error("The question could not be found.");
      const updated = makeQuestion(input, existing.id);
      questions = questions.map((question) =>
        question.id === existing.id ? updated : question,
      );
      return updated;
    }
    const question = makeQuestion(input, `question-${Date.now()}`);
    questions = [question, ...questions];
    return question;
  },
  async deleteQuestion(id) {
    requirePermission(contextForUser(ADMIN_USER_ID), "questions.delete");
    if (quizzes.some((quiz) => quiz.questionIds.includes(id))) {
      throw new Error("This question is used by a quiz and cannot be deleted yet.");
    }
    questions = questions.filter((question) => question.id !== id);
  },
  async listQuestionFacets() {
    requirePermission(contextForUser(ADMIN_USER_ID), "questions.view");
    return {
      categories: [...new Set(questions.map((question) => question.category))].sort(),
      subjects: [...new Set(questions.map((question) => question.subject))].sort(),
    };
  },
  async listQuizzes() {
    requirePermission(contextForUser(ADMIN_USER_ID), "quizzes.view");
    return [...quizzes];
  },
  async getQuiz(id) {
    requirePermission(contextForUser(ADMIN_USER_ID), "quizzes.view");
    return quizzes.find((quiz) => quiz.id === id);
  },
  async saveQuiz(input) {
    const context = contextForUser(ADMIN_USER_ID);
    requirePermission(context, input.id ? "quizzes.update" : "quizzes.create");
    if (input.status === "published") {
      requirePermission(context, "quizzes.publish");
    }
    if (input.questionIds.length === 0) {
      throw new Error("Add at least one question to the quiz.");
    }
    const totalMarks = questionTotalMarks(input.questionIds);
    if (input.passingMarks > totalMarks) {
      throw new Error("Passing marks cannot exceed the quiz total.");
    }
    const now = new Date().toISOString();
    const existing = input.id
      ? quizzes.find((quiz) => quiz.id === input.id)
      : undefined;
    if (input.id && !existing) throw new Error("The quiz could not be found.");
    const quiz: Quiz = {
      id: existing?.id ?? `quiz-${Date.now()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      instructions: input.instructions.trim(),
      questionIds: [...input.questionIds],
      durationMinutes: input.durationMinutes,
      passingMarks: input.passingMarks,
      status: input.status,
      availability: input.availability,
      availableFrom: input.availability === "scheduled" ? input.availableFrom : undefined,
      availableUntil: input.availability === "scheduled" ? input.availableUntil : undefined,
      createdBy: existing?.createdBy ?? ADMIN_USER_ID,
      updatedAt: now,
      attemptsCount: existing?.attemptsCount ?? 0,
      averageScore: existing?.averageScore ?? 0,
    };
    quizzes = existing
      ? quizzes.map((item) => (item.id === quiz.id ? quiz : item))
      : [quiz, ...quizzes];
    return quiz;
  },
  async setQuizStatus(id, status) {
    const context = contextForUser(ADMIN_USER_ID);
    requirePermission(
      context,
      status === "published" ? "quizzes.publish" : "quizzes.update",
    );
    const quiz = findQuiz(id);
    const updated = { ...quiz, status, updatedAt: new Date().toISOString() };
    quizzes = quizzes.map((item) => (item.id === id ? updated : item));
    return updated;
  },
  async listUsers(filters: UserFilters = {}) {
    requirePermission(contextForUser(ADMIN_USER_ID), "users.view");
    const search = filters.search?.trim().toLocaleLowerCase() ?? "";
    return users.filter((user) => {
      const matchesSearch =
        !search ||
        [user.name, user.email].some((value) =>
          value.toLocaleLowerCase().includes(search),
        );
      const matchesStatus =
        !filters.status || filters.status === "all" || user.status === filters.status;
      const matchesRole =
        !filters.roleId || filters.roleId === "all" || user.roleId === filters.roleId;
      return matchesSearch && matchesStatus && matchesRole;
    });
  },
  async updateUserStatus(id, status: AccountStatus) {
    requirePermission(contextForUser(ADMIN_USER_ID), "users.manage");
    const user = findUser(id);
    const updated = { ...user, status };
    users = users.map((item) => (item.id === id ? updated : item));
    return updated;
  },
  async listCreators() {
    requirePermission(contextForUser(ADMIN_USER_ID), "creators.view");
    return users.filter((user) => user.roleId === INSTRUCTOR_ROLE_ID);
  },
  async inviteCreator(input: CreatorInviteInput) {
    requirePermission(contextForUser(ADMIN_USER_ID), "creators.manage");
    const name = input.name.trim();
    const email = input.email.trim();
    if (!name || !email || !email.includes("@")) {
      throw new Error("Enter a name and a valid email address.");
    }
    if (users.some((user) => user.email.toLocaleLowerCase() === email.toLocaleLowerCase())) {
      throw new Error("An account with this email already exists.");
    }
    const joinedAt = new Date().toISOString();
    const creator: PlatformUser = {
      id: `usr-instructor-${Date.now()}`,
      name,
      email,
      roleId: INSTRUCTOR_ROLE_ID,
      status: "invited",
      joinedAt,
      lastActiveAt: joinedAt,
      completedQuizCount: 0,
      averageScore: 0,
      subject: input.subject.trim() || undefined,
    };
    users = [creator, ...users];
    return creator;
  },
  async updateCreatorPermissions(id, permissions) {
    requirePermission(contextForUser(ADMIN_USER_ID), "creators.manage");
    const creator = findUser(id);
    if (creator.roleId !== INSTRUCTOR_ROLE_ID) {
      throw new Error("Permissions can only be assigned to content creators.");
    }
    creatorPermissionOverrides.set(id, [...new Set(permissions)]);
  },
  async getCreatorPermissions(id) {
    requirePermission(contextForUser(ADMIN_USER_ID), "creators.view");
    const creator = findUser(id);
    if (creator.roleId !== INSTRUCTOR_ROLE_ID) {
      throw new Error("The selected user is not a content creator.");
    }
    return [
      ...(creatorPermissionOverrides.get(id) ?? findRole(creator.roleId).permissions),
    ];
  },
  async listRoles() {
    requirePermission(contextForUser(ADMIN_USER_ID), "roles.view");
    return [...roles];
  },
  async updateRolePermissions(roleId, permissions) {
    requirePermission(contextForUser(ADMIN_USER_ID), "roles.manage");
    const role = findRole(roleId);
    if (role.permissionsLocked) {
      throw new Error("Super Admin permissions cannot be edited.");
    }
    const updated = { ...role, permissions: [...new Set(permissions)] };
    roles = roles.map((item) => (item.id === roleId ? updated : item));
    return updated;
  },
  async listSubmissions(status: SubmissionStatus | "all" = "all") {
    requirePermission(contextForUser(ADMIN_USER_ID), "submissions.view");
    return submissions.filter(
      (submission) => status === "all" || submission.status === status,
    );
  },
  async getSubmission(id) {
    requirePermission(contextForUser(ADMIN_USER_ID), "submissions.view");
    return submissions.find((submission) => submission.id === id);
  },
  async reviewSubmission(id, answers) {
    requirePermission(contextForUser(ADMIN_USER_ID), "submissions.review");
    const submission = findSubmission(id);
    const quizQuestionIds = new Set(findQuiz(submission.quizId).questionIds);
    const marksByQuestion = new Map(
      questions.map((question) => [question.id, question.marks]),
    );
    if (answers.some((answer) =>
      !quizQuestionIds.has(answer.questionId) ||
      answer.awardedMarks === undefined ||
      answer.awardedMarks < 0 ||
      answer.awardedMarks > (marksByQuestion.get(answer.questionId) ?? 0),
    )) {
      throw new Error("Review scores must match the quiz questions and available marks.");
    }
    const score = answers.reduce(
      (total, answer) => total + (answer.awardedMarks ?? 0),
      0,
    );
    const updated: QuizSubmission = {
      ...submission,
      answers: answers.map((answer) => ({ ...answer })),
      score,
      status: "reviewed",
    };
    submissions = submissions.map((item) => (item.id === id ? updated : item));
    return updated;
  },
  async getPlatformSettings() {
    requirePermission(contextForUser(ADMIN_USER_ID), "settings.manage");
    return { ...settings };
  },
  async savePlatformSettings(nextSettings: PlatformSettings) {
    requirePermission(contextForUser(ADMIN_USER_ID), "settings.manage");
    settings = { ...nextSettings };
    return { ...settings };
  },
  async updateAdminProfile(profile: ProfileInput) {
    requirePermission(contextForUser(ADMIN_USER_ID), "settings.manage");
    const name = profile.name.trim();
    const email = profile.email.trim();
    if (!name || !email || !email.includes("@")) {
      throw new Error("Enter a name and a valid email address.");
    }
    if (users.some((user) =>
      user.id !== ADMIN_USER_ID &&
      user.email.toLocaleLowerCase() === email.toLocaleLowerCase(),
    )) {
      throw new Error("Another account already uses this email address.");
    }
    const updated = { ...findUser(ADMIN_USER_ID), name, email };
    users = users.map((user) => user.id === ADMIN_USER_ID ? updated : user);
    return updated;
  },
  async getStudentDashboard() {
    const context = contextForUser(STUDENT_USER_ID);
    requirePermission(context, "learning.dashboard.view");
    const mySubmissions = submissions
      .filter((submission) => submission.userId === context.user.id)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    const averageScore =
      mySubmissions.length === 0
        ? 0
        : Math.round(
            mySubmissions.reduce(
              (total, submission) =>
                total + (submission.score / submission.totalMarks) * 100,
              0,
            ) / mySubmissions.length,
          );
    return {
      availableQuizCount: quizzes.filter((quiz) => quiz.status === "published").length,
      completedQuizCount: mySubmissions.length,
      averageScore,
      learningStreak: 6,
      recentActivity: mockActivity.filter(
        (item) => item.kind === "quiz" || item.kind === "submission",
      ),
      recentSubmissions: mySubmissions.slice(0, 3),
    };
  },
  async listAvailableQuizzes() {
    const context = contextForUser(STUDENT_USER_ID);
    requirePermission(context, "learning.quizzes.view");
    return quizzes.filter((quiz) => quiz.status === "published");
  },
  async getStudentQuiz(id) {
    const context = contextForUser(STUDENT_USER_ID);
    requirePermission(context, "learning.quizzes.view");
    const quiz = quizzes.find(
      (item) => item.id === id && item.status === "published",
    );
    if (!quiz) return undefined;
    const studentQuestions = getQuizQuestions(quiz.questionIds).map(
      redactStudentQuestion,
    );
    return { quiz, questions: studentQuestions };
  },
  async submitQuiz(quizId, answerMap) {
    const context = contextForUser(STUDENT_USER_ID);
    requirePermission(context, "learning.quizzes.take");
    const quiz = findQuiz(quizId);
    if (getQuizAvailability(quiz) !== "available") {
      throw new Error("This quiz is not currently available.");
    }
    const quizQuestions = getQuizQuestions(quiz.questionIds);
    const scored = scoreAnswers(quizQuestions, answerMap);
    const priorAttempts = submissions.filter(
      (submission) =>
        submission.quizId === quizId && submission.userId === context.user.id,
    );
    const submission: QuizSubmission = {
      id: `sub-${Date.now()}`,
      quizId,
      userId: context.user.id,
      submittedAt: new Date().toISOString(),
      score: scored.score,
      totalMarks: questionTotalMarks(quiz.questionIds),
      status: scored.needsReview ? "needs-review" : "reviewed",
      answers: scored.answers,
      attemptNumber: priorAttempts.length + 1,
    };
    submissions = [submission, ...submissions];
    quizzes = quizzes.map((item) =>
      item.id === quizId ? { ...item, attemptsCount: item.attemptsCount + 1 } : item,
    );
    users = users.map((user) =>
      user.id === context.user.id
        ? {
            ...user,
            completedQuizCount: user.completedQuizCount + 1,
            averageScore: Math.round(
              (user.averageScore * user.completedQuizCount +
                (submission.score / submission.totalMarks) * 100) /
                (user.completedQuizCount + 1),
            ),
          }
        : user,
    );
    return submission;
  },
  async listMyResults() {
    const context = contextForUser(STUDENT_USER_ID);
    requirePermission(context, "learning.results.view");
    return submissions
      .filter((submission) => submission.userId === context.user.id)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  },
  async getMyResult(id): Promise<StudentSubmissionDetails | undefined> {
    const context = contextForUser(STUDENT_USER_ID);
    requirePermission(context, "learning.results.view");
    const submission = submissions.find(
      (item) => item.id === id && item.userId === context.user.id,
    );
    if (!submission) return undefined;
    const quiz = quizzes.find((item) => item.id === submission.quizId);
    if (!quiz) return undefined;
    const studentQuestions = getQuizQuestions(quiz.questionIds).map(
      redactStudentQuestion,
    );
    return { submission, quiz, questions: studentQuestions };
  },
  async updateMyProfile(profile: ProfileInput) {
    const context = contextForUser(STUDENT_USER_ID);
    requirePermission(context, "profile.manage");
    if (!profile.name.trim() || !profile.email.trim()) {
      throw new Error("Name and email are required.");
    }
    const updated = {
      ...context.user,
      name: profile.name.trim(),
      email: profile.email.trim(),
    };
    users = users.map((user) => (user.id === updated.id ? updated : user));
    return updated;
  },
};

export function getRoleForUser(user: PlatformUser): RoleDefinition {
  return findRole(user.roleId);
}
