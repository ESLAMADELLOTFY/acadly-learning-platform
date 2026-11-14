import HeroSection from "@acadly/modules/user/auth/components/HeroSection";
import { SignupForm } from "@acadly/modules/user/auth/components/SignupForm";
import { AcadlyLogo } from "@acadly/assets/components/AcadlyLogo";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex w-full flex-1 flex-col px-6 py-7 sm:px-12 lg:max-w-[56%] lg:px-16 xl:px-24">
        <AcadlyLogo />
        <div className="flex flex-1 items-center py-10 lg:py-12">
          <SignupForm />
        </div>
        <p className="text-center text-xs text-muted lg:text-left">
          Create your Acadly account to start learning
        </p>
      </div>
      <HeroSection />
    </main>
  );
}
