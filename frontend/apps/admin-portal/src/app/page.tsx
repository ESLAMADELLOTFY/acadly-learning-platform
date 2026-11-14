import Link from "next/link";
import { AcadlyLogo } from "@acadly/assets/components/AcadlyLogo";
import { Icon } from "@acadly/infrastructure/components/common";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-secondary-light/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -right-24 size-96 rounded-full bg-primary/10 blur-3xl" />
      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-border bg-white shadow-[0_28px_90px_rgba(27,48,35,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center px-7 py-12 sm:px-12 sm:py-16 lg:px-16">
          <Link href="/" className="mb-12 flex w-fit items-center gap-3">
            <AcadlyLogo
              size={44}
            />
          </Link>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary-light/50 bg-[#edf4ee] px-3 py-1.5 text-xs font-semibold text-primary">
            <Icon name="sparkles" size={14} />
            A calmer way to learn
          </span>
          <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Learning that moves you <span className="text-primary">forward.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            Practice with thoughtful quizzes, understand your progress, and build confidence one step at a time.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard/overview" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-bold text-label transition hover:bg-surface-hover">
              Open admin portal <Icon name="grid" size={16} />
            </Link>
          </div>
          <p className="mt-7 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="font-bold text-primary hover:underline">Sign in</Link>
            <span className="mx-2 text-border">·</span>
            <Link href="/signup" className="font-semibold text-primary hover:underline">Create account</Link>
          </p>
          <p className="mt-8 max-w-lg text-xs leading-5 text-muted">
            The learning portals use demonstration data in this phase. Production role and permission enforcement belongs on the backend.
          </p>
        </div>
        <div className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden bg-[#173c2c] px-10 py-12 text-white lg:flex xl:px-14">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#a5cfaa]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 size-64 rounded-full bg-[#c4ddcb]/10 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">One learning home</p>
            <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight">From a curious question to a confident answer.</h2>
          </div>
          <div className="relative space-y-3">
            {[
              { icon: "book" as const, title: "Learn with purpose", description: "Explore focused quizzes built by your educators." },
              { icon: "activity" as const, title: "See your progress", description: "Turn every completed attempt into a next step." },
              { icon: "shield" as const, title: "Create with clarity", description: "Give educators practical tools to build better assessments." },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#c7e0c9]">
                  <Icon name={item.icon} size={19} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-white/60">{item.description}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="relative text-xs text-white/45">Thoughtful learning. Measurable growth.</p>
        </div>
      </section>
    </main>
  );
}
