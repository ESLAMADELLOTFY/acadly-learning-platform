# Acadly APIs

The backend is a NestJS monorepo with separate `admin-api` and `student-api`
applications. Both applications connect to the same MySQL database and share
user accounts and roles. The student API owns registration; the admin API owns
protected user management.

## Run locally

1. Copy `.env.example` to `.env`, set the MySQL credentials, and provide the
   same private `JWT_SECRET` to both APIs.
2. Create the database named in `DB_DATABASE` and grant the configured user
   access to it.
3. Install dependencies and start the admin API first:

   ```bash
   npm install
   npm run start:dev:admin
   ```

4. In a second terminal, start the student API:

   ```bash
   npm run start:dev:student
   ```

The admin API listens on port `4000` and the student API on port `4001` by
default. Startup output in each terminal shows the API URL. `FRONTEND_URL`
accepts a comma-separated list of allowed portal origins. Only the admin API
runs TypeORM migrations; start it first to create or update the shared schema.
Both applications keep schema synchronization disabled.

## Accounts and roles

Accounts support `super_admin`, `admin`, `instructor`, and `student` roles.
Public registration is available at `POST /auth/register` on the student API
and always assigns the `student` role; the request cannot assign administrative
roles. The admin API exposes `GET /users` and related management endpoints to
authenticated admin or super-admin accounts.

To bootstrap the first admin, register the account normally, then promote it
through a trusted database session:

```sql
UPDATE users
SET roles = JSON_ARRAY('super_admin')
WHERE email = 'admin@example.com';
```

Both APIs return roles from `/auth/me`, while authorization checks current
roles in the database on protected requests.

## Useful scripts

```bash
npm run build
npm run build:admin
npm run build:student
npm run start:dev:admin
npm run start:dev:student
npm run lint
npm test
npm run test:e2e
```
