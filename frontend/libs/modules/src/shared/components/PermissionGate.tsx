import type { ReactNode } from "react";
import type { PermissionKey } from "@acadly/modules/shared/models/learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";

type PermissionGateProps = {
  permissions: readonly PermissionKey[];
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({
  permissions,
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  return hasPermission(permissions, permission) ? children : fallback;
}
