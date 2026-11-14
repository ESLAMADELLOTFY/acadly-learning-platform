# Acadly Learning

Acadly is a learning and assessment platform built with Next.js App Router, React, TypeScript, and Tailwind CSS 4.

## Run locally

Install dependencies once from this directory:

```bash
pnpm install
```

Run either portal independently:

```bash
pnpm dev:admin
pnpm dev:student
```

The admin portal runs at [http://localhost:3000](http://localhost:3000), and the student portal runs at [http://localhost:3001](http://localhost:3001). Next.js prints each portal's local URL in the terminal when it starts.

## App structure

```text
apps/
  admin-portal/
    src/
      app/
  student-portal/
    src/
      app/
libs/
  assets/
    src/components/
  infrastructure/
    src/apis/
    src/components/common/
    src/hooks/
  modules/
    src/admin/
    src/user/
    src/shared/
pnpm-workspace.yaml
turbo.json
```

Each portal is an independent Next.js app in the pnpm/Turborepo workspace. Public routes such as `/`, `/signin`, `/signup`, and account-support pages live directly under that portal's `src/app`. The account-support routes are shared styled screens; backend flows for password recovery, invitations, and two-factor authentication are not connected yet. `/login` redirects to `/signin`, and `/forgot-password` redirects to `/forget-password`. Every authenticated page lives under `src/app/dashboard`, which shares that portal's dashboard layout and is protected by its proxy. For example, `apps/admin-portal/src/app/dashboard/reports/page.tsx` creates `/dashboard/reports`.

Keep route files focused on Next.js routing and import the page components from the matching module package: admin features from `@acadly/modules/admin/...`, student features from `@acadly/modules/user/...`, and reusable domain models, data, and services from `@acadly/modules/shared/...`. Add feature-specific components, hooks, and interfaces under `libs/modules/src/admin/<feature>` or `libs/modules/src/user/<feature>`, then import them from a route in that portal's `src/app`. Reusable UI components, API clients, and hooks belong in `libs/infrastructure`; Acadly branding components belong in `libs/assets`.

The admin dashboard contains overview, instructors, questions, quizzes, roles, submissions, users, and settings pages. The student dashboard contains overview, profile, quizzes, and results pages. Existing `/admin/*` and `/learn/*` URLs redirect to their matching dashboard routes.

Use `pnpm dev:admin` or `pnpm dev:student` for one portal, and `pnpm build`, `pnpm lint`, or `pnpm type-check` to run workspace tasks through Turborepo.

## Data, authentication, and permissions

Learning-platform demonstration data remains in-memory and resets on a full page reload. The admin portal calls the admin API at `http://localhost:4000` by default; the student portal calls the student API at `http://localhost:4001`. Set `ADMIN_API_URL` or `STUDENT_API_URL` in the frontend environment to override these API origins. Student registration is served by the student API; the admin portal's `/signup` route redirects to the student portal. Set `STUDENT_PORTAL_URL` to override its default `http://localhost:3001/signup` destination. Both APIs set the `access_token` as an HTTP-only cookie; the frontend does not store or replace that token.

Adding a page does not grant runtime access. Portal permission checks shape mock navigation and visible actions only; production authorization, grading, quiz availability, and answer-key protection must be enforced by the backend.

## Validation

```bash
pnpm lint
pnpm type-check
pnpm build
```
