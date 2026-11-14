"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_NAVIGATION, hasPermission } from "@acadly/modules/shared/models/permissions";
import type { PortalContext } from "@acadly/modules/shared/services/contracts";
import { AcadlyLogo } from "@acadly/assets/components/AcadlyLogo";
import { Icon } from "@acadly/infrastructure/components/common";
import { PermissionProvider } from "@acadly/modules/shared/providers/PermissionContext";

type AdminPortalShellProps = {
  context: PortalContext;
  children: React.ReactNode;
};

export function AdminPortalShell({ context, children }: AdminPortalShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const visibleNavigation = ADMIN_NAVIGATION.filter((item) =>
    hasPermission(context.permissions, item.permission),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {menuOpen && (
        <button
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-border bg-white px-4 py-5 transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/dashboard/overview" className="flex items-center gap-3 px-2">
          <AcadlyLogo />
          <span className="ml-auto rounded-md bg-surface-hover px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-dark">
            Admin
          </span>
        </Link>

        <div className="mb-2 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
          Workspace
        </div>
        <nav aria-label="Admin navigation" className="flex flex-col gap-1">
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
                    ? "bg-[#eaf2ec] text-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-[#f4f7f3] p-4">
          <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            <Icon name="help" size={18} />
          </div>
          <p className="text-sm font-bold">Need a hand?</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Update your platform settings or contact support for help.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-border px-2 pt-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#e6eee8] text-xs font-bold text-primary">
            {context.user.name.split(" ").map((part) => part[0]).join("")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{context.user.name}</p>
            <p className="truncate text-xs text-muted">{context.user.email}</p>
          </div>
          <Link
            href="/dashboard/account"
            aria-label="Account and platform settings"
            className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-primary"
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
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover lg:hidden"
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
            <div className="hidden items-center gap-2 text-sm text-muted sm:flex">
              <span>Workspace</span>
              <Icon name="arrow-right" size={14} />
              <span className="font-semibold text-foreground">
                {visibleNavigation.find((item) =>
                  item.href === "/dashboard/overview"
                    ? pathname === item.href
                    : pathname.startsWith(item.href),
                )?.label ?? "Administration"}
              </span>
            </div>
            <p className="text-sm font-bold sm:hidden">Admin workspace</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-right">
              <span className="block text-xs font-semibold">{context.user.name}</span>
              <span className="hidden text-[11px] text-muted sm:block">
                Learning administrator
              </span>
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {context.user.name.split(" ").map((part) => part[0]).join("")}
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9">
          <PermissionProvider permissions={context.permissions}>
            {children}
          </PermissionProvider>
        </main>
      </div>
    </div>
  );
}
