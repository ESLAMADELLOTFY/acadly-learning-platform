"use client";
import Link from "next/link";
import { usePasswordVisibility } from "../hooks/usePasswordVisibility";
import { EyeIcon } from "../icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signInSchema } from "../schemas/sign_in.schema";
import type { SignInFormValues } from "../schemas/sign_in.schema";
import { getSignInErrorMessage, signInUser } from "../services/signin.service";
import { useState } from "react";
import { useRouter } from "next/navigation";
const inputClassName =
  "w-full rounded-xl border border-border bg-input px-4 py-3.5 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20";

export function SignInForm() {
  const { visible, toggle, type } = usePasswordVisibility();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    mode: "onChange",
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setServerError(null);
    try {
      await signInUser({
        email: data.email,
        password: data.password,
      });
      router.push("/dashboard");
    } catch (error: unknown) {
      setServerError(getSignInErrorMessage(error));
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-[440px] flex-col gap-6 font-inter"
    >
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold leading-none text-foreground sm:text-[42px]">
          Sign In
        </h1>

        <p className="text-base leading-[150%] text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline"
          >
            Create now
          </Link>
        </p>
      </div>

      {/* Server Error Message */}
      {serverError ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-500 border border-red-200">
          {serverError}
        </div>
      ):null}

      {/* Form Fields */}
      <div className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm text-muted">
            E-mail
          </label>

          <input
            id="email"
            type="email"
            {...register("email")}
            autoComplete="email"
            placeholder="example@gmail.com"
            className={inputClassName}
          />

          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm text-muted">
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={type}
              {...register("password")}
              autoComplete="current-password"
              placeholder="@#*%"
              className={`${inputClassName} pr-14`}
            />

            <button
              type="button"
              onClick={toggle}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center gap-3 px-3 text-muted"
            >
              <span
                className="h-6 w-px bg-border"
                aria-hidden="true"
              />
              <EyeIcon open={visible} />
            </button>
          </div>

          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between gap-8">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="size-4 rounded border-checkbox accent-primary"
            />
            Remember me
          </label>

          <a
            href="mailto:support@acadly.edu?subject=Password%20reset"
            className="text-sm font-medium text-secondary-dark underline"
          >
            Need help signing in?
          </a>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary px-4 py-3.5 text-[16px] font-medium text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

    </form>
  );
}
