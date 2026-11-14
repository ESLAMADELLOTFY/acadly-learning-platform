import Link from "next/link";
import { AcadlyLogo } from "@acadly/assets/components/AcadlyLogo";
import { Icon } from "@acadly/infrastructure/components/common";

type PublicAction = {
  label: string;
  href: string;
};

type PublicPageContent = {
  title: string;
  description: string;
  primaryAction: PublicAction;
  secondaryAction?: PublicAction;
};

const publicPages = {
  "account-locked": {
    title: "Your account is locked",
    description:
      "You can’t sign in to this account right now. Review the recovery options or contact support if you think this is a mistake.",
    primaryAction: { label: "View recovery options", href: "/account-recovery-options" },
    secondaryAction: { label: "Contact support", href: "mailto:support@acadly.edu" },
  },
  "account-recovery-options": {
    title: "Recover your account",
    description:
      "Choose a safe way to regain access to your Acadly account.",
    primaryAction: { label: "Forgot your password?", href: "/forget-password" },
    secondaryAction: { label: "Contact support", href: "mailto:support@acadly.edu" },
  },
  "account-temporarily-locked": {
    title: "Sign-in is temporarily paused",
    description:
      "There have been several recent sign-in attempts. Wait a little before trying again, or review your account recovery options.",
    primaryAction: { label: "View recovery options", href: "/account-recovery-options" },
    secondaryAction: { label: "Return to sign in", href: "/signin" },
  },
  "forget-password": {
    title: "Forgot your password?",
    description:
      "Password recovery isn’t connected yet. You can review your account recovery options or contact support for help.",
    primaryAction: { label: "View recovery options", href: "/account-recovery-options" },
    secondaryAction: { label: "Return to sign in", href: "/signin" },
  },
  invitation: {
    title: "You’re invited to Acadly",
    description:
      "Your invitation will include a secure link and its expiration details. Ask the person who invited you to resend it if you can’t find it.",
    primaryAction: { label: "Go to sign in", href: "/signin" },
    secondaryAction: { label: "Join the community", href: "/join-our-community" },
  },
  "join-our-community": {
    title: "Join the Acadly community",
    description:
      "Find your next learning opportunity and connect with your educators. Community enrollment details will be available soon.",
    primaryAction: { label: "Create an account", href: "/signup" },
    secondaryAction: { label: "Back to home", href: "/" },
  },
  "password-reset-successfully": {
    title: "Password reset confirmation",
    description:
      "When account recovery is connected, this page will confirm that your password has been updated.",
    primaryAction: { label: "Go to sign in", href: "/signin" },
  },
  "reset-password": {
    title: "Choose a new password",
    description:
      "A verified password-reset link is required to continue. Password updates aren’t enabled in this preview.",
    primaryAction: { label: "View recovery options", href: "/account-recovery-options" },
    secondaryAction: { label: "Return to sign in", href: "/signin" },
  },
  "service-under-maintenance": {
    title: "Acadly is under maintenance",
    description:
      "We’re working on the service right now. Please try again later.",
    primaryAction: { label: "Back to home", href: "/" },
    secondaryAction: { label: "Go to sign in", href: "/signin" },
  },
  "two-factor-authentication": {
    title: "Verify your identity",
    description:
      "When two-factor sign-in is enabled, enter the verification code from your authenticator or email to continue.",
    primaryAction: { label: "Return to sign in", href: "/signin" },
    secondaryAction: { label: "Contact support", href: "mailto:support@acadly.edu" },
  },
  "verify-forgot-password": {
    title: "Verify your account",
    description:
      "Account recovery verifies your identity before allowing a password change. This recovery flow isn’t connected yet.",
    primaryAction: { label: "View recovery options", href: "/account-recovery-options" },
    secondaryAction: { label: "Return to sign in", href: "/signin" },
  },
} satisfies Record<string, PublicPageContent>;

export type PublicAuthPageKey = keyof typeof publicPages;

export function PublicAuthPage({ page }: { page: PublicAuthPageKey }) {
  const content = publicPages[page];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8">
      <div
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-secondary-light/35 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-36 -right-24 size-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <section className="relative w-full max-w-2xl rounded-[30px] border border-border bg-white p-7 shadow-[0_28px_90px_rgba(27,48,35,0.12)] sm:p-12">
        <Link href="/" aria-label="Acadly home" className="inline-flex">
          <AcadlyLogo size={40} />
        </Link>
        <div className="mt-12 flex size-12 items-center justify-center rounded-2xl bg-secondary-light/35 text-primary">
          <Icon name="help" size={22} />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.15em] text-secondary-dark">
          Account support
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          {content.description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={content.primaryAction.href}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-light"
          >
            {content.primaryAction.label}
            <Icon name="arrow-right" size={16} />
          </Link>
          {"secondaryAction" in content && (
            <Link
              href={content.secondaryAction.href}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-background"
            >
              {content.secondaryAction.label}
            </Link>
          )}
        </div>
        <p className="mt-12 text-xs text-muted">
          Need more help?{" "}
          <a
            href="mailto:support@acadly.edu"
            className="font-semibold text-primary underline"
          >
            Contact Acadly support
          </a>
        </p>
      </section>
    </main>
  );
}
