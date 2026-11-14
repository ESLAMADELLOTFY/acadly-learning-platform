"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { PlatformUser } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { Button, Card, Icon, PageHeading, TextField } from "@acadly/infrastructure/components/common";

export function StudentProfilePage() {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void mockLearningPlatform.getStudentContext()
      .then((context) => {
        if (!active) return;
        setUser(context.user);
        setName(context.user.name);
        setEmail(context.user.email);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Profile could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await mockLearningPlatform.updateMyProfile({ name, email });
      setUser(updated);
      setMessage("Your profile has been updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-16 text-center text-sm text-muted">Loading profile…</p>;
  if (!user) {
    return <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error ?? "Profile could not be loaded."}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeading
        eyebrow="Your account"
        title="Profile"
        description="Keep your personal information up to date."
      />
      {error && <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>}
      {message && <div role="status" className="rounded-xl border border-success/20 bg-[#eff8f0] px-4 py-3 text-sm text-success">{message}</div>}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e6eee8] text-sm font-bold text-primary">
              {user.name.split(" ").map((part) => part[0]).join("")}
            </span>
            <div>
              <h2 className="font-bold">Personal information</h2>
              <p className="mt-1 text-xs text-muted">This is how you’ll appear in your learning space.</p>
            </div>
          </div>
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            <TextField label="Full name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
            <TextField label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
            </div>
          </form>
        </Card>
        <div className="space-y-5">
          <Card>
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#edf4ee] text-primary"><Icon name="shield" /></div>
            <h2 className="mt-4 font-bold">Account details</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <dt className="text-xs text-muted">Account status</dt>
                <dd className="text-xs font-semibold capitalize">{user.status}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <dt className="text-xs text-muted">Member since</dt>
                <dd className="text-xs font-semibold">{new Date(user.joinedAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-muted">Last active</dt>
                <dd className="text-right text-xs font-semibold">{new Date(user.lastActiveAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </Card>
          <Card className="bg-[#f0f5f0]">
            <h2 className="text-sm font-bold">Need to change your password?</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              For account security, contact your platform administrator to update your sign-in credentials.
            </p>
            <a href="mailto:support@acadly.edu" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              Contact support <Icon name="arrow-right" size={14} />
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
