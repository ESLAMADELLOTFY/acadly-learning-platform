Here’s a ready-to-paste root `README.md`. Update the screenshots section later if you add images.

````markdown
# Acadly Learning Platform

Acadly is a learning and assessment platform with separate portals for administrators and students. It uses Next.js for the frontends and NestJS for the APIs.

## Applications

| Application | URL |
|---|---|
| Admin portal | http://localhost:3000 |
| Student portal | http://localhost:3001 |
| Admin API | http://localhost:4000 |
| Student API | http://localhost:4001 |

## Features

- Separate admin and student portals
- Shared backend services and MySQL database
- Role-aware authentication and user management
- Admin and student dashboards

## Tech stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript
- **Database:** MySQL
- **Workspace tools:** pnpm and Turborepo for the frontend

## Project structure

```text
backend/
  apps/
    admin-api/
    student-api/
  libs/
frontend/
  apps/
    admin-portal/
    student-portal/
  libs/
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- pnpm 9 or newer
- MySQL

### Configure and run the backend

1. Create a MySQL database.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set the database credentials and a private `JWT_SECRET` in `backend/.env`.
4. Install and start the APIs in separate terminals:

```bash
cd backend
npm install
npm run start:dev:admin
```

```bash
cd backend
npm run start:dev:student
```

The admin API runs on port `4000`; the student API runs on port `4001`. Start the admin API first so it can run database migrations.

### Configure and run the frontend

Install dependencies and start each portal in a separate terminal:

```bash
cd frontend
pnpm install
pnpm dev:admin
```

```bash
cd frontend
pnpm dev:student
```

The admin portal runs on port `3000`; the student portal runs on port `3001`.

## Environment variables

The backend uses `backend/.env` for database credentials, the JWT secret, API ports, and allowed frontend origins. Do not commit this file or put real credentials in the repository.

Optional frontend variables can override the default API URLs and student portal URL. See the [frontend README](frontend/README.md) and [backend README](backend/README.md) for details.

## Validation

From `frontend/`:

```bash
pnpm lint
pnpm type-check
pnpm build
```

From `backend/`:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```
````
