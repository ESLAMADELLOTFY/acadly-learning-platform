"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PermissionKey } from "@acadly/modules/shared/models/learning-platform";

const PermissionContext = createContext<readonly PermissionKey[] | null>(null);

export function PermissionProvider({
  permissions,
  children,
}: {
  permissions: readonly PermissionKey[];
  children: ReactNode;
}) {
  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePortalPermissions(): readonly PermissionKey[] {
  const permissions = useContext(PermissionContext);
  if (!permissions) {
    throw new Error("Portal permissions must be read inside a portal provider.");
  }
  return permissions;
}
