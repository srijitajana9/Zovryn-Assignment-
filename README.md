# Finance Data Processing and Access Control Backend

Express.js + MongoDB backend for a finance dashboard with role-based access control, financial record management, and dashboard analytics.

## Tech Stack

- Node.js (CommonJS)
- Express 5
- MongoDB + Mongoose
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Validation (`zod`)

## Features Implemented

- User and role management (`viewer`, `analyst`, `admin`)
- User status management (`active`, `inactive`)
- JWT-based authentication and protected routes
- Role-based access control middleware
- Financial records CRUD
- Records filtering, sorting, and pagination
- Dashboard aggregation APIs:
  - total income
  - total expense
  - net balance
  - category-wise totals
  - recent activity
  - weekly/monthly trends
- Standardized error responses and request validation
- In-memory rate limiting (global + auth routes)
- Seed script for demo users and records
- Basic automated tests (validation + rate limiting)

## Project Structure

```text
src/
  app.js
  server.js
  config/
  middlewares/
  models/
  modules/
    auth/
    users/
    records/
    dashboard/
  routes/
  scripts/
test/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Ensure MongoDB is running and update `MONGO_URI` in `.env`.

4. Start server:

```bash
npm run dev
```

Or production mode:

```bash
npm start
```

## Environment Variables

From [`.env.example`](./.env.example):

- `PORT` (default `5000`)
- `APP_BASE_URL` (default `http://localhost:5000`, used by Swagger server URL)
- `MONGO_URI` (required)
- `NODE_ENV` (default `development`)
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (default `1d`)
- `GLOBAL_RATE_LIMIT_WINDOW_MS`
- `GLOBAL_RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`

## Seeding Demo Data

```bash
npm run seed
```

Creates users (if missing):

- `admin@zovryn.local` (`admin`)
- `analyst@zovryn.local` (`analyst`)
- `viewer@zovryn.local` (`viewer`)

Default password:

- `Password@123`

To force-refresh records:

```bash
FORCE_SEED=true npm run seed
```

## Auth and Role Matrix

- `viewer`: read records + dashboard
- `analyst`: read records + dashboard
- `admin`: full access (users + records + dashboard)

## API Overview

Base URL: `http://localhost:5000`

Swagger Docs:

- Interactive UI: `GET /api-docs`
- Raw OpenAPI JSON: `GET /openapi.json`
- Hosted docs URI format: `<YOUR_BASE_URL>/api-docs`

### Health

- `GET /health`

### Auth

- `POST /auth/bootstrap-admin` (one-time bootstrap when no users exist)
- `POST /auth/login`
- `GET /auth/me` (auth required)
- `POST /auth/register` (admin only)

### Users (admin only)

- `GET /users`
- `POST /users`
- `PATCH /users/:userId`

### Financial Records

- `GET /records` (`viewer|analyst|admin`)
- `GET /records/:recordId` (`viewer|analyst|admin`)
- `POST /records` (`admin`)
- `PATCH /records/:recordId` (`admin`)
- `DELETE /records/:recordId` (`admin`)

Query params for `GET /records`:

- `type=income|expense`
- `category`
- `startDate`, `endDate`
- `page` (default 1), `limit` (default 20, max 100)
- `sortBy=date|amount|createdAt`
- `sortOrder=asc|desc`

### Dashboard

- `GET /dashboard/summary` (`viewer|analyst|admin`)
- `GET /dashboard/category-totals` (`viewer|analyst|admin`)
- `GET /dashboard/recent-activity` (`viewer|analyst|admin`)
- `GET /dashboard/trends` (`viewer|analyst|admin`)

Query params:

- `/dashboard/summary` and `/dashboard/category-totals`: `startDate`, `endDate`
- `/dashboard/recent-activity`: `limit` (1-50, default 10)
- `/dashboard/trends`: `period=weekly|monthly`, `months` (1-24, default 6)

## Response Format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": []
  }
}
```

## Curl Examples

Login:

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zovryn.local","password":"Password@123"}'
```

Get records (with token):

```bash
curl http://localhost:5000/records?page=1&limit=10 \
  -H "Authorization: Bearer <TOKEN>"
```

Create record (admin):

```bash
curl -X POST http://localhost:5000/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"amount":1200,"type":"income","category":"Sales","date":"2026-04-04","note":"Invoice"}'
```

Dashboard summary:

```bash
curl http://localhost:5000/dashboard/summary \
  -H "Authorization: Bearer <TOKEN>"
```

## Tests

Run tests:

```bash
npm test
```

Current tests cover:

- Validation logic for auth/records/dashboard query schemas
- Rate limit middleware behavior (`429` after threshold)

## Requirement Mapping

1. User and Role Management
- Implemented via `User` model, auth routes, admin user routes, RBAC middleware, and status checks.

2. Financial Records Management
- Implemented via records CRUD endpoints, filters, sorting, pagination, and validation.

3. Dashboard Summary APIs
- Implemented via aggregation endpoints for summary, category totals, recent activity, and trends.

4. Access Control Logic
- Implemented via `requireAuth` + `allowRoles` middlewares, role checks per route.

5. Validation and Error Handling
- Implemented via Zod validation middleware and centralized error handler with stable error shape.

6. Data Persistence
- Implemented with MongoDB + Mongoose models and indexes.

## Assumptions and Tradeoffs

- JWT is stateless and no refresh-token flow is implemented (kept simple for assessment scope).
- Rate limiting is in-memory; suitable for single-instance local/demo use.
- Records use hard delete for now (soft delete can be added in a later phase).
- `bootstrap-admin` is allowed only when there are zero users.
