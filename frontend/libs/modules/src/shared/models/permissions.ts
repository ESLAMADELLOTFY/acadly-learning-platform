import type { PermissionKey } from "./learning-platform";
import type { IconName } from "./icons";

export const ADMIN_NAVIGATION = [
  { label: "Overview", href: "/dashboard/overview", icon: "home", permission: "dashboard.view" },
  { label: "Question bank", href: "/dashboard/questions", icon: "book", permission: "questions.view" },
  { label: "Quizzes", href: "/dashboard/quizzes", icon: "grid", permission: "quizzes.view" },
  { label: "Users", href: "/dashboard/users", icon: "users", permission: "users.view" },
  { label: "Instructors", href: "/dashboard/instructors", icon: "book", permission: "creators.view" },
  { label: "Submissions", href: "/dashboard/submissions", icon: "activity", permission: "submissions.view" },
  { label: "Roles & permissions", href: "/dashboard/roles", icon: "shield", permission: "roles.view" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings", permission: "settings.manage" },
] as const satisfies readonly {
  label: string;
  href: string;
  icon: IconName;
  permission: PermissionKey;
}[];

export const STUDENT_NAVIGATION = [
  { label: "My learning", href: "/dashboard/overview", icon: "home", permission: "learning.dashboard.view" },
  { label: "Explore quizzes", href: "/dashboard/quizzes", icon: "book", permission: "learning.quizzes.view" },
  { label: "My results", href: "/dashboard/results", icon: "activity", permission: "learning.results.view" },
  { label: "My profile", href: "/dashboard/profile", icon: "users", permission: "profile.manage" },
] as const satisfies readonly {
  label: string;
  href: string;
  icon: IconName;
  permission: PermissionKey;
}[];

export function hasPermission(
  permissions: readonly PermissionKey[],
  permission: PermissionKey,
): boolean {
  return permissions.includes(permission);
}
