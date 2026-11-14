import Link from "next/link";
import { Icon } from "@acadly/infrastructure/components/common/Icon";

const highlights = [
  {
    icon: "book" as const,
    title: "Learn with intention",
    description: "Practice with focused quizzes built around your course.",
  },
  {
    icon: "activity" as const,
    title: "Understand your progress",
    description: "See your results and decide what to work on next.",
  },
  {
    icon: "sparkles" as const,
    title: "Make every attempt count",
    description: "Build confidence through clear feedback and steady practice.",
  },
];

export default function HeroSection() {
  return (
    <aside className="relative hidden min-h-screen w-full max-w-[48%] flex-col justify-between overflow-hidden bg-[#173c2c] px-10 py-10 text-white lg:flex xl:px-14">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 90% 5%, rgba(166,207,170,0.2), transparent 60%), radial-gradient(ellipse 55% 40% at 5% 100%, rgba(126,171,135,0.13), transparent 65%)",
        }}
      />
      <div className="relative flex items-center justify-between">
        <Link href="/" className="text-sm font-bold text-white/85 hover:text-white">
          Acadly learning
        </Link>
        <a
          href="mailto:support@acadly.edu"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
        >
          <Icon name="help" size={17} /> Support
        </a>
      </div>

      <div className="relative mx-auto w-full max-w-lg py-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-white/80">
          <Icon name="sparkles" size={14} className="text-[#b8d7bd]" />
          Your next step starts here
        </span>
        <h2 className="mt-6 text-4xl font-bold leading-[1.12] tracking-tight xl:text-[46px]">
          Make progress feel natural.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
          A thoughtful space for learners to practice and educators to create meaningful assessments.
        </p>
        <div className="mt-9 space-y-3">
          {highlights.map((item) => (
            <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#c5dfc8]">
                <Icon name={item.icon} size={19} />
              </span>
              <span>
                <span className="block text-sm font-bold">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-white/55">{item.description}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-xs text-white/40">
        A clearer path to confident learning.
      </p>
    </aside>
  );
}
