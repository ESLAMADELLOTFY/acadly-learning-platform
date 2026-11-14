"use client";

import { useEffect, useState } from "react";
import type { PermissionKey, RoleDefinition } from "@acadly/modules/shared/models/learning-platform";
import { PERMISSION_GROUPS } from "@acadly/modules/shared/models/permission-catalog";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";
import { usePortalPermissions } from "@acadly/modules/shared/providers/PermissionContext";
import { Badge, Button, Card, Icon, PageHeading } from "@acadly/infrastructure/components/common";

export function RolePermissionsPage() {
  const permissions = usePortalPermissions();
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);
  const [savedPermissions, setSavedPermissions] = useState<PermissionKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedRole = roles.find((role) => role.id === selectedId);
  const canManage = hasPermission(permissions, "roles.manage");
  const dirty =
    selectedPermissions.length !== savedPermissions.length ||
    selectedPermissions.some((permission) => !savedPermissions.includes(permission));

  useEffect(() => {
    let active = true;
    void mockLearningPlatform.listRoles()
      .then((data) => {
        if (!active) return;
        setRoles(data);
        const firstRole = data[0];
        if (firstRole) {
          setSelectedId(firstRole.id);
          setSelectedPermissions(firstRole.permissions);
          setSavedPermissions(firstRole.permissions);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Roles could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);

  const togglePermission = (permission: PermissionKey) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  };

  const save = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const updated = await mockLearningPlatform.updateRolePermissions(
        selectedRole.id,
        selectedPermissions,
      );
      setRoles((current) => current.map((role) => role.id === updated.id ? updated : role));
      setSavedPermissions([...updated.permissions]);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Role permissions could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Access control"
        title="Roles & permissions"
        description="Assign capabilities explicitly so access can evolve beyond fixed role names."
      />
      {error && <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>}
      <div className="grid gap-5 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]">
        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-bold">Platform roles</h2>
            <p className="mt-1 text-xs text-muted">Role definitions and member counts</p>
          </div>
          <div className="divide-y divide-border">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                aria-pressed={selectedId === role.id}
                onClick={() => {
                  setSelectedId(role.id);
                  setSelectedPermissions(role.permissions);
                  setSavedPermissions(role.permissions);
                }}
                className={`w-full px-5 py-4 text-left transition ${
                  selectedId === role.id ? "bg-[#f0f5f0]" : "hover:bg-surface-hover/70"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-sm font-bold">{role.name}</span>
                  {role.system && <Badge>System</Badge>}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted">{role.description}</span>
                <span className="mt-2 block text-[11px] font-medium text-secondary-dark">
                  {role.memberCount} members · {role.permissions.length} permissions
                </span>
              </button>
            ))}
          </div>
        </Card>

        {selectedRole ? (
          <Card padding="none" className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="font-bold">{selectedRole.name}</h2>
                <p className="mt-1 text-xs text-muted">{selectedRole.description}</p>
              </div>
              {canManage && !selectedRole.permissionsLocked && (
                <Button size="sm" disabled={!dirty || saving} onClick={() => void save()}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              )}
            </div>
            {selectedRole.permissionsLocked && (
              <div className="flex items-center gap-2 border-b border-border bg-[#fafbfa] px-5 py-3 text-xs text-muted">
                <Icon name="shield" size={15} />
                This system role has protected access permissions.
              </div>
            )}
            <div className="divide-y divide-border">
              {PERMISSION_GROUPS.map((group) => (
                <fieldset key={group.label} className="px-5 py-4">
                  <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary-dark">
                    {group.label}
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.permissions.map((permission) => (
                      <label key={permission.key} className={`flex items-center gap-2.5 text-sm text-label ${canManage && !selectedRole.permissionsLocked ? "cursor-pointer" : ""}`}>
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.key)}
                          onChange={() => togglePermission(permission.key)}
                          disabled={!canManage || Boolean(selectedRole.permissionsLocked)}
                          className="size-4 rounded accent-primary"
                        />
                        {permission.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            {!canManage && (
              <p className="border-t border-border px-5 py-3 text-xs text-muted">
                You have view-only access to role permissions.
              </p>
            )}
          </Card>
        ) : (
          <Card className="flex min-h-72 items-center justify-center text-sm text-muted">
            Select a role to view its permissions.
          </Card>
        )}
      </div>
    </div>
  );
}
