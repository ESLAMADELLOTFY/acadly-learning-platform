"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@acadly/infrastructure/apis/api";
import {
  Button,
  Card,
  Icon,
  PageHeading,
} from "@acadly/infrastructure/components/common";

type User = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    API.get<User[]>("/users")
      .then(({ data }) => {
        if (active) {
          setUsers(data);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Users could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.roles.some((role) => role.toLowerCase().includes(query)),
    );
  }, [search, users]);

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="People"
        title="User management"
        description="Review the accounts registered on the shared Acadly platform."
      />
      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="relative w-full sm:max-w-sm">
            <span className="sr-only">Search users</span>
            <Icon
              name="search"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or role"
              className="min-h-10 w-full rounded-xl border border-border bg-input pl-10 pr-3 text-sm outline-none focus:border-secondary"
            />
          </label>
          <span className="text-sm text-muted">
            {users.length} {users.length === 1 ? "account" : "accounts"}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 border-b border-error/20 bg-[#fff4f3] px-5 py-3 text-sm text-error"
          >
            <span>{error}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setLoading(true);
                setReloadKey((key) => key + 1);
              }}
            >
              Try again
            </Button>
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading users…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-[#fafbfa] text-[11px] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    ID
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Roles
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fbfcfb]">
                    <td className="px-5 py-4 text-sm text-label">{user.id}</td>
                    <td className="px-4 py-4 text-sm font-semibold">
                      {user.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-label">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-label">
                      {user.roles.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && !error && (
              <div className="py-14 text-center text-sm text-muted">
                {search ? "No users match your search." : "No users found."}
              </div>
            )}
          </div>
        )}
        {!loading && (
          <div className="border-t border-border px-5 py-3 text-xs text-muted">
            Showing {filteredUsers.length} of {users.length} accounts
          </div>
        )}
      </Card>
    </div>
  );
}
