"use client";

import { useEffect, useMemo, useState } from "react";
import type { PermissionKey, PlatformUser, Question, Quiz } from "@acadly/modules/shared/models/learning-platform";
import { mockLearningPlatform } from "@acadly/modules/shared/services/mock-learning-platform";
import { hasPermission } from "@acadly/modules/shared/models/permissions";
import { usePortalPermissions } from "@acadly/modules/shared/providers/PermissionContext";
import { Badge, Button, Card, Icon, PageHeading, TextField } from "@acadly/infrastructure/components/common";
import type { FormEvent } from "react";

const creatorPermissionOptions: {
  key: PermissionKey;
  label: string;
  description: string;
}[] = [
  { key: "questions.view", label: "View question bank", description: "Browse reusable learning questions." },
  { key: "questions.create", label: "Create questions", description: "Add new questions to the shared bank." },
  { key: "questions.update", label: "Edit questions", description: "Update content and scoring details." },
  { key: "quizzes.view", label: "View quizzes", description: "Review existing assessments." },
  { key: "quizzes.create", label: "Create quizzes", description: "Build assessments from approved questions." },
  { key: "quizzes.update", label: "Edit quizzes", description: "Change quiz content and availability." },
  { key: "submissions.view", label: "View submissions", description: "Review learner assessment activity." },
  { key: "submissions.review", label: "Review answers", description: "Grade and provide feedback on submissions." },
];

export function InstructorManagementPage() {
  const permissions = usePortalPermissions();
  const [creators, setCreators] = useState<PlatformUser[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [assignedPermissions, setAssignedPermissions] = useState<PermissionKey[]>([]);
  const [savedPermissions, setSavedPermissions] = useState<PermissionKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSubject, setInviteSubject] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canManage = hasPermission(permissions, "creators.manage");
  const selectedCreator = creators.find((creator) => creator.id === selectedId);

  useEffect(() => {
    let active = true;
    void Promise.all([
      mockLearningPlatform.listCreators(),
      mockLearningPlatform.listQuestions(),
      mockLearningPlatform.listQuizzes(),
    ]).then(async ([creatorData, questionData, quizData]) => {
      if (!active) return;
      setCreators(creatorData);
      setQuestions(questionData);
      setQuizzes(quizData);
      const firstCreator = creatorData[0];
      if (firstCreator) {
        setSelectedId(firstCreator.id);
        const assigned = await mockLearningPlatform.getCreatorPermissions(firstCreator.id);
        if (active) {
          setAssignedPermissions(assigned);
          setSavedPermissions(assigned);
        }
      }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Instructors could not be loaded.");
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    void mockLearningPlatform.getCreatorPermissions(selectedId)
      .then((assigned) => {
        if (active) {
          setAssignedPermissions(assigned);
          setSavedPermissions(assigned);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Instructor permissions could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const contentCounts = useMemo(() => ({
    questions: questions.filter((question) => question.createdBy === selectedId).length,
    quizzes: quizzes.filter((quiz) => quiz.createdBy === selectedId).length,
  }), [questions, quizzes, selectedId]);
  const isDirty =
    assignedPermissions.length !== savedPermissions.length ||
    assignedPermissions.some((permission) => !savedPermissions.includes(permission));

  const togglePermission = (permission: PermissionKey) => {
    setAssignedPermissions((current) =>
      current.includes(permission)
        ? current.filter((value) => value !== permission)
        : [...current, permission],
    );
  };

  const savePermissions = async () => {
    if (!selectedCreator) return;
    setSaving(true);
    try {
      await mockLearningPlatform.updateCreatorPermissions(selectedCreator.id, assignedPermissions);
      setSavedPermissions([...assignedPermissions]);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Instructor permissions could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const inviteCreator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const creator = await mockLearningPlatform.inviteCreator({
        name: inviteName,
        email: inviteEmail,
        subject: inviteSubject,
      });
      setCreators((current) => [creator, ...current]);
      setSelectedId(creator.id);
      setAssignedPermissions([]);
      setSavedPermissions([]);
      setInviteName("");
      setInviteEmail("");
      setInviteSubject("");
      setInviteOpen(false);
      setError(null);
    } catch (cause) {
      setInviteError(cause instanceof Error ? cause.message : "Instructor invitation could not be created.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="People & access"
        title="Instructors"
        description="Manage content creators and assign the precise capabilities they need."
        actions={canManage ? (
          <Button onClick={() => {
            setInviteError(null);
            setInviteOpen(true);
          }}>
            <Icon name="plus" size={16} /> Invite instructor
          </Button>
        ) : null}
      />
      {error && <div role="alert" className="rounded-xl border border-error/20 bg-[#fff4f3] px-4 py-3 text-sm text-error">{error}</div>}
      <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)]">
        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-bold">Content creators</h2>
            <p className="mt-1 text-xs text-muted">{creators.length} instructors</p>
          </div>
          <div className="divide-y divide-border">
            {creators.map((creator) => (
              <button
                key={creator.id}
                type="button"
                aria-pressed={selectedId === creator.id}
                onClick={() => setSelectedId(creator.id)}
                className={`flex w-full items-center gap-3 px-5 py-4 text-left transition ${
                  selectedId === creator.id ? "bg-[#f0f5f0]" : "hover:bg-surface-hover/70"
                }`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e6eee8] text-xs font-bold text-primary">
                  {creator.name.split(" ").map((part) => part[0]).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{creator.name}</span>
                  <span className="mt-1 block truncate text-xs text-muted">{creator.subject ?? creator.email}</span>
                </span>
                <Icon name="arrow-right" size={15} className="text-muted" />
              </button>
            ))}
            {creators.length === 0 && (
              <p className="px-5 py-12 text-center text-sm text-muted">No content creators found.</p>
            )}
          </div>
        </Card>

        {selectedCreator ? (
          <div className="space-y-5">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e6eee8] font-bold text-primary">
                    {selectedCreator.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <div>
                    <h2 className="font-bold">{selectedCreator.name}</h2>
                    <p className="mt-1 text-xs text-muted">{selectedCreator.email}</p>
                  </div>
                </div>
                <Badge tone={selectedCreator.status === "active" ? "success" : "neutral"} dot>
                  {selectedCreator.status}
                </Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f7f8f6] p-3">
                  <p className="text-xs text-muted">Questions created</p>
                  <p className="mt-1 text-xl font-bold">{contentCounts.questions}</p>
                </div>
                <div className="rounded-xl bg-[#f7f8f6] p-3">
                  <p className="text-xs text-muted">Quizzes created</p>
                  <p className="mt-1 text-xl font-bold">{contentCounts.quizzes}</p>
                </div>
              </div>
            </Card>
            <Card padding="none" className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <h2 className="font-bold">Content permissions</h2>
                  <p className="mt-1 text-xs text-muted">Access is controlled by specific capabilities.</p>
                </div>
                {canManage && (
                  <Button size="sm" disabled={!isDirty || saving} onClick={() => void savePermissions()}>
                    {saving ? "Saving…" : "Save access"}
                  </Button>
                )}
              </div>
              <div className="divide-y divide-border">
                {creatorPermissionOptions.map((option) => (
                  <label key={option.key} className={`flex items-start gap-3 px-5 py-3.5 ${canManage ? "cursor-pointer" : ""}`}>
                    <input
                      type="checkbox"
                      checked={assignedPermissions.includes(option.key)}
                      onChange={() => togglePermission(option.key)}
                      disabled={!canManage}
                      className="mt-1 size-4 rounded accent-primary disabled:opacity-70"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-muted">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              {!canManage && (
                <p className="border-t border-border px-5 py-3 text-xs text-muted">
                  You have view-only access to instructor permissions.
                </p>
              )}
            </Card>
          </div>
        ) : (
          <Card className="flex min-h-72 items-center justify-center text-sm text-muted">
            Select an instructor to manage content access.
          </Card>
        )}
      </div>
      {inviteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-foreground/35 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-creator-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="invite-creator-title" className="text-lg font-bold">Invite an instructor</h2>
                <p className="mt-1 text-sm text-muted">Create a mock invited account and assign permissions.</p>
              </div>
              <Button variant="ghost" size="sm" aria-label="Close invite dialog" onClick={() => setInviteOpen(false)}>
                <Icon name="close" size={18} />
              </Button>
            </div>
            <form onSubmit={(event) => void inviteCreator(event)} className="mt-5 space-y-4">
              {inviteError && (
                <p role="alert" className="rounded-lg bg-[#fff4f3] px-3 py-2 text-sm text-error">
                  {inviteError}
                </p>
              )}
              <TextField label="Full name" value={inviteName} onChange={(event) => setInviteName(event.target.value)} required />
              <TextField label="Email address" type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} required />
              <TextField label="Subject area (optional)" value={inviteSubject} onChange={(event) => setInviteSubject(event.target.value)} placeholder="e.g. Biology" />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create invitation"}</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
