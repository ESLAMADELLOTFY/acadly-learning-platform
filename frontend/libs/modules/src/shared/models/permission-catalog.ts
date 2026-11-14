import type { PermissionKey } from "./learning-platform";

export const PERMISSION_GROUPS: {
  label: string;
  permissions: { key: PermissionKey; label: string }[];
}[] = [
  {
    label: "Platform",
    permissions: [
      { key: "dashboard.view", label: "View platform dashboard" },
      { key: "settings.manage", label: "Manage platform settings" },
    ],
  },
  {
    label: "Question bank",
    permissions: [
      { key: "questions.view", label: "View questions" },
      { key: "questions.create", label: "Create questions" },
      { key: "questions.update", label: "Edit questions" },
      { key: "questions.delete", label: "Delete questions" },
    ],
  },
  {
    label: "Quizzes",
    permissions: [
      { key: "quizzes.view", label: "View quizzes" },
      { key: "quizzes.create", label: "Create quizzes" },
      { key: "quizzes.update", label: "Edit quizzes" },
      { key: "quizzes.publish", label: "Publish quizzes" },
    ],
  },
  {
    label: "People",
    permissions: [
      { key: "users.view", label: "View users" },
      { key: "users.manage", label: "Manage user accounts" },
      { key: "creators.view", label: "View content creators" },
      { key: "creators.manage", label: "Manage content creators" },
    ],
  },
  {
    label: "Access control",
    permissions: [
      { key: "roles.view", label: "View roles and permissions" },
      { key: "roles.manage", label: "Manage role permissions" },
    ],
  },
  {
    label: "Submissions",
    permissions: [
      { key: "submissions.view", label: "View submissions" },
      { key: "submissions.review", label: "Review and score answers" },
    ],
  },
];
