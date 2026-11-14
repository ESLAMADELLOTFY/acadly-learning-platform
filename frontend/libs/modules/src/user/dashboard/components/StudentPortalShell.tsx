"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { STUDENT_NAVIGATION, hasPermission } from "@acadly/modules/shared/models/permissions";
import type { PortalContext } from "@acadly/modules/shared/services/contracts";
import { AcadlyLogo } from "@acadly/assets/components/AcadlyLogo";
import { Icon } from "@acadly/infrastructure/components/common";
import { PermissionProvider } from "@acadly/modules/shared/providers/PermissionContext";
import { useGetUser } from "@acadly/infrastructure/hooks/get_user.hook";

type StudentPortalShellProps = {
  context: PortalContext;
  children: React.ReactNode;
};

export function StudentPortalShell({
  context,
  children,
}: StudentPortalShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const visibleNavigation = STUDENT_NAVIGATION.filter((item) =>
    hasPermission(context.permissions, item.permission),
  );
const {user} = useGetUser();
  return (
    <div className="min-h-screen bg-[#f7f8f6] text-foreground">
      {menuOpen && (
        <button
          aria-label="Close learning menu"
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-[#173c2c] px-4 py-5 text-white transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/dashboard/overview" className="flex items-center gap-3 px-2">
          <AcadlyLogo color="white" />
          <span className="ml-auto rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
            Learn
          </span>
        </Link>

        <div className="mb-2 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
          Your learning
        </div>
        <nav aria-label="Student navigation" className="flex flex-col gap-1">
          {visibleNavigation.map((item) => {
            const active =
              item.href === "/dashboard/overview"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-white text-[#173c2c]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/75">Weekly goal</span>
            <Icon name="sparkles" size={16} className="text-[#b8d7bd]" />
          </div>
          <p className="mt-3 text-2xl font-bold">4 of 5</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
            <span className="block h-full w-4/5 rounded-full bg-[#a8d1ae]" />
          </div>
          <p className="mt-2 text-[11px] text-white/55">
            One more quiz to reach your goal.
          </p>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-2 pt-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#c4ddc8] text-xs font-bold text-[#173c2c]">
            {user?.name.split(" ").map((part) => part[0]).join("")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-white/50">{user?.email}</p>
          </div>
          <Link
            href="/dashboard/account"
            aria-label="Account settings"
            className="rounded-lg p-2 text-white/65 hover:bg-white/10 hover:text-white"
          >
            <Icon name="settings" size={17} />
          </Link>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Close learning menu" : "Open learning menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover lg:hidden"
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
            <span className="hidden text-sm text-muted sm:inline">
              Your learning space
            </span>
            <p className="text-sm font-bold sm:hidden">Learning space</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/quizzes"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-light sm:px-4"
            >
              <Icon name="plus" size={15} />
              <span className="hidden sm:inline">Find a quiz</span>
              <span className="sm:hidden">Explore</span>
            </Link>
            <span className="flex size-9 items-center justify-center rounded-full bg-[#e6eee8] text-xs font-bold text-primary">
              {user?.name.split(" ").map((part) => part[0]).join("")}
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1280px] px-4 py-7 sm:px-7 sm:py-9">
          <PermissionProvider permissions={context.permissions}>
            {children}
          </PermissionProvider>
        </main>
      </div>
    </div>
  );
}
