import type {
  AccountStatus,
  AdminDashboardData,
  CreatorInviteInput,
  PlatformSettings,
  PlatformUser,
  ProfileInput,
  Question,
  QuestionFilters,
  QuestionInput,
  Quiz,
  QuizInput,
  QuizSubmission,
  RoleDefinition,
  StudentDashboardData,
  StudentQuizDetails,
  StudentSubmissionDetails,
  SubmissionAnswer,
  SubmissionStatus,
  UserFilters,
} from "@acadly/modules/shared/models/learning-platform";
import type { PermissionKey } from "@acadly/modules/shared/models/learning-platform";

export interface PortalContext {
  user: PlatformUser;
  permissions: PermissionKey[];
}

export interface LearningPlatformService {
  getAdminContext(): Promise<PortalContext>;
  getStudentContext(): Promise<PortalContext>;
  getAdminDashboard(): Promise<AdminDashboardData>;
  listQuestions(filters?: QuestionFilters): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  saveQuestion(input: QuestionInput): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  listQuestionFacets(): Promise<{ categories: string[]; subjects: string[] }>;
  listQuizzes(): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  saveQuiz(input: QuizInput): Promise<Quiz>;
  setQuizStatus(id: string, status: Quiz["status"]): Promise<Quiz>;
  listUsers(filters?: UserFilters): Promise<PlatformUser[]>;
  updateUserStatus(id: string, status: AccountStatus): Promise<PlatformUser>;
  listCreators(): Promise<PlatformUser[]>;
  inviteCreator(input: CreatorInviteInput): Promise<PlatformUser>;
  updateCreatorPermissions(
    id: string,
    permissions: PermissionKey[],
  ): Promise<void>;
  getCreatorPermissions(id: string): Promise<PermissionKey[]>;
  listRoles(): Promise<RoleDefinition[]>;
  updateRolePermissions(
    roleId: string,
    permissions: PermissionKey[],
  ): Promise<RoleDefinition>;
  listSubmissions(status?: SubmissionStatus | "all"): Promise<QuizSubmission[]>;
  getSubmission(id: string): Promise<QuizSubmission | undefined>;
  reviewSubmission(
    id: string,
    answers: SubmissionAnswer[],
  ): Promise<QuizSubmission>;
  getPlatformSettings(): Promise<PlatformSettings>;
  savePlatformSettings(settings: PlatformSettings): Promise<PlatformSettings>;
  updateAdminProfile(profile: ProfileInput): Promise<PlatformUser>;
  getStudentDashboard(): Promise<StudentDashboardData>;
  listAvailableQuizzes(): Promise<Quiz[]>;
  getStudentQuiz(id: string): Promise<StudentQuizDetails | undefined>;
  submitQuiz(
    quizId: string,
    answers: Record<string, string>,
  ): Promise<QuizSubmission>;
  listMyResults(): Promise<QuizSubmission[]>;
  getMyResult(id: string): Promise<StudentSubmissionDetails | undefined>;
  updateMyProfile(profile: ProfileInput): Promise<PlatformUser>;
}
