"use client";

import { useEffect, useState, type FormEvent } from "react";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import type { PlatformUser } from "@acadly/modules/shared/models/learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";
import { usePortalPermissions } from "@acadly/modules/shared/providers/PermissionContext";
import { Button, Card, Icon, PageHeading, TextField } from "@acadly/infrastructure/components/common";

export function PlatformSettingsPage() {
  const permissions = usePortalPermissions();
  const [platformName, setPlatformName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [defaultQuizDuration, setDefaultQuizDuration] = useState(30);
  const [allowRetakes, setAllowRetakes] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [adminUser, setAdminUser] = useState<PlatformUser | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canManage = hasPermission(permissions, "settings.manage");

  useEffect(() => {
    let active = true;
    void Promise.all([
      mockLearningPlatform.getPlatformSettings(),
      mockLearningPlatform.getAdminContext(),
    ]).then(([settings, context]) => {
      if (!active) return;
      setPlatformName(settings.platformName);
      setSupportEmail(settings.supportEmail);
      setDefaultQuizDuration(settings.defaultQuizDuration);
      setAllowRetakes(settings.allowRetakes);
      setShowCorrectAnswers(settings.showCorrectAnswers);
      setAdminUser(context.user);
      setProfileName(context.user.name);
      setProfileEmail(context.user.email);
      setLoading(false);
    }).catch((cause: unknown) => {
      if (active) {
        setError(cause instanceof Error ? cause.message : "Settings could not be loaded.");
        setLoading(false);
      }
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
      await mockLearningPlatform.savePlatformSettings({
        platformName,
        supportEmail,
        defaultQuizDuration,
        allowRetakes,
        showCorrectAnswers,
      });
      setMessage("Your settings have been saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaving(true);
    setError(null);
    setProfileMessage(null);
    try {
      const updated = await mockLearningPlatform.updateAdminProfile({
        name: profileName,
        email: profileEmail,
      });
      setAdminUser(updated);
      setProfileMessage("Your account profile has been updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your profile could not be updated.");
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) return <p className="py-16 text-center text-sm text-muted">Loading settings…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeading
        eyebrow="Platform configuration"
        title="Settings"
        description="Configure platform defaults and your administrative preferences."
      />
      {error && <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>}
      {message && <div role="status" className="rounded-xl border border-success/20 bg-[#eff8f0] px-4 py-3 text-sm text-success">{message}</div>}
      <form onSubmit={(event) => void submit(event)} className="space-y-5">
        <Card className="space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf4ee] text-primary"><Icon name="grid" /></span>
            <div>
              <h2 className="font-bold">General settings</h2>
              <p className="mt-1 text-xs text-muted">Brand and support contact information.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Platform name" value={platformName} onChange={(event) => setPlatformName(event.target.value)} required disabled={!canManage} />
            <TextField label="Support email" type="email" value={supportEmail} onChange={(event) => setSupportEmail(event.target.value)} required disabled={!canManage} />
          </div>
        </Card>
        <Card className="space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf4ee] text-primary"><Icon name="clock" /></span>
            <div>
              <h2 className="font-bold">Assessment defaults</h2>
              <p className="mt-1 text-xs text-muted">Set sensible defaults for new quizzes and learner results.</p>
            </div>
          </div>
          <TextField
            label="Default quiz duration (minutes)"
            type="number"
            min={1}
            max={240}
            value={defaultQuizDuration}
            onChange={(event) => setDefaultQuizDuration(Number(event.target.value))}
            disabled={!canManage}
            required
          />
          {[
            {
              label: "Allow quiz retakes",
              description: "Let learners attempt the same assessment more than once.",
              value: allowRetakes,
              onChange: setAllowRetakes,
            },
            {
              label: "Show correct answers after review",
              description: "Reveal answer keys when an assessment attempt is complete.",
              value: showCorrectAnswers,
              onChange: setShowCorrectAnswers,
            },
          ].map((item) => (
            <label key={item.label} className="flex items-start gap-3 border-t border-border pt-4">
              <input
                type="checkbox"
                checked={item.value}
                onChange={(event) => item.onChange(event.target.checked)}
                disabled={!canManage}
                className="mt-1 size-4 rounded accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs text-muted">{item.description}</span>
              </span>
            </label>
          ))}
        </Card>
        <div className="flex justify-end">
          {canManage ? (
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          ) : (
            <p role="status" className="text-sm text-muted">You have view-only access to settings.</p>
          )}
        </div>
      </form>
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf4ee] text-primary"><Icon name="users" /></span>
          <div>
            <h2 className="font-bold">Account & profile</h2>
            <p className="mt-1 text-xs text-muted">Update your administrator profile information.</p>
          </div>
        </div>
        {profileMessage && <p role="status" className="mt-4 rounded-lg bg-[#eff8f0] px-3 py-2 text-sm text-success">{profileMessage}</p>}
        <form onSubmit={(event) => void saveProfile(event)} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Full name" value={profileName} onChange={(event) => setProfileName(event.target.value)} required disabled={!canManage} />
            <TextField label="Email address" type="email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} required disabled={!canManage} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted">
              Signed in as {adminUser?.email}. Contact support to change your password.
            </p>
            {canManage && <Button type="submit" variant="secondary" disabled={profileSaving}>{profileSaving ? "Saving…" : "Save profile"}</Button>}
          </div>
        </form>
      </Card>
    </div>
  );
}
