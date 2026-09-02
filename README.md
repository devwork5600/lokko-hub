# Lokko Hub

From-scratch rebuild of [Lokko](https://www.lokkohub.com/), a local-goods marketplace app,
built as a learning exercise focused on a proper CI/CD workflow (git branching, GitHub Actions,
Vercel + Railway deployment strategy).

## Stack

- `apps/web` — Next.js marketplace UI
- `apps/socket` — real-time Socket.io server
- `apps/worker` — BullMQ background jobs
- `packages/db` — Prisma + PostGIS
- `packages/validations` — shared zod schemas

## Local setup

```bash
npm install
npm run dev
```
