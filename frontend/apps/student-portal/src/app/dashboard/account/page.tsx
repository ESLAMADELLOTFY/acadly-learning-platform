"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetUser } from "@acadly/infrastructure/hooks/get_user.hook";
import api from "@acadly/infrastructure/apis/api";
import { Button, Card, Icon } from "@acadly/infrastructure/components/common";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, error: loadError } = useGetUser();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setLogoutError(null);
    setIsSigningOut(true);
    try {
      await api.post("/auth/logout");
      router.replace("/signin");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to sign out. Please try again.",
      );
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Loading your account…</div>;
  }
  if (loadError || !user) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-5">
        <Card className="max-w-md text-center">
          <h1 className="text-xl font-bold">We couldn’t load your account</h1>
          <p role="alert" className="mt-2 text-sm text-error">{loadError ?? "Please sign in again."}</p>
          <Link href="/signin" className="mt-5 inline-flex font-semibold text-primary hover:underline">Go to sign in</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex justify-end">
        <Button variant="secondary" disabled={isSigningOut} onClick={() => void signOut()}>
          {isSigningOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
      {logoutError && (
        <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">
          {logoutError}
        </div>
      )}
      <section className="mt-12 rounded-[28px] bg-[#173c2c] px-6 py-8 text-white sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/55">Your account</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Welcome, {user.name.split(" ")[0]}.</h1>
        <p className="mt-2 text-sm text-white/70">{user.email}</p>
        <p className="mt-5 max-w-xl text-sm leading-6 text-white/70">
          Continue to your student portal. Learning tools are currently powered by realistic demonstration data.
        </p>
      </section>
      <section className="max-w-2xl">
        <Card className="flex flex-col">
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#edf4ee] text-primary"><Icon name="book" /></span>
          <h2 className="mt-5 text-lg font-bold">Student portal</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
            Discover quizzes, take assessments, review your scores, and keep track of your learning.
          </p>
          <Link href="/dashboard/overview" className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary-light">
            Go to learning <Icon name="arrow-right" size={16} />
          </Link>
        </Card>
      </section>
      <p className="text-center text-xs text-muted">
        Portal demonstration data is separate from your authenticated account.
      </p>
    </div>
  );
}
