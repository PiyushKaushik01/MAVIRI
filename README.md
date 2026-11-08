# Maviri

Maviri is an anime discovery and community platform built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, and Better Auth. Anime catalogue content comes from the live AniList GraphQL API.

See [the final website draft](docs/MAVIRI_FINAL_WEBSITE_DRAFT.md) for the consolidated product vision, route map, first-prototype scope, and remaining production roadmap.

## Start the app

```powershell
npm install
npm run dev
```

On this Windows development setup, the first `npm run dev` initializes a private PostgreSQL cluster under `%LOCALAPPDATA%\Maviri`, generates an ignored `.env.local`, applies migrations, and starts the cluster on `127.0.0.1:5433`. Subsequent dev starts bring that cluster back online automatically. PostgreSQL 18 client tools are required at `C:\Program Files\PostgreSQL\18\bin`.

You can also manage the local database explicitly:

```powershell
npm run db:local:setup
npm run db:local:stop
```

The home page and discovery catalogue show live AniList trends and search results. AniList requests are made server-side through `/api/anime` and `/api/anime/[id]`. Anime detail pages use clean paths such as `/anime/21`.

## Database and authentication

For another operating system or a hosted environment, set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in `.env.local` (or the platform's secret manager). Keep real credentials out of source control. Prisma loads `.env.local` and `.env` for database commands.

```powershell
npm run db:generate
npm run db:deploy
```

The Better Auth API is available at `/api/auth/*` once the database and secret are configured. The migration creates auth, library, community, profile, notification, report, and moderation records. AniList catalogue metadata is fetched live and is not mirrored into PostgreSQL. `/api/health` reports whether the database is reachable without exposing credentials.

Moderator roles must be assigned by an administrator in PostgreSQL, for example:

```sql
UPDATE "User" SET "role" = 'MODERATOR' WHERE "email" = 'moderator@example.com';
```

## Website routes

- `/` — live trending anime and community feed
- `/discover` — AniList search and trending titles
- `/anime/[id]` — anime details and library quick-add
- `/sign-in` — account sign-in and registration
- `/library` — personal anime tracking and custom lists
- `/library/stats` — live personal collection statistics and an interactive 3D view
- `/community` — community feed and post composer
- `/community/[postId]` — post discussion and threaded replies
- `/bookmarks` — saved community posts
- `/notifications` — account activity
- `/profile/[username]` — public profile
- `/settings/profile` — profile editing
- `/moderation` — report queue for moderators and admins

## API routes

- `/api/anime`, `/api/anime/[id]` — AniList discovery and details
- `/api/health` — application database health
- `/api/auth/[...all]` — Better Auth
- `/api/library`, `/api/library/[entryId]` — personal anime tracking
- `/api/library/lists`, `/api/library/lists/[listId]` — custom library lists
- `/api/community/posts` and nested routes — posts, reactions, replies, and reports
- `/api/community/follow/[userId]` — follow relationships
- `/api/profile`, `/api/profile/[username]` — profile settings and public profiles
- `/api/bookmarks` — saved posts
- `/api/notifications` — account activity
- `/api/moderation/reports` and `/api/moderation/reports/[reportId]` — moderation queue and decisions

## Deployment checklist

1. Provision PostgreSQL and set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and the public `BETTER_AUTH_URL` in the hosting provider's secret settings.
2. Run `npm run db:deploy` as the release migration step.
3. Build with `npm run build`, then serve with `npm run start` or the hosting provider's Next.js runtime.
4. Check `/api/health` after deployment. It returns `200` only when the database responds.
5. Assign moderator roles through an administrator-controlled database session. Never expose a general role-edit action to users.

The local PostgreSQL helper is for development only. Hosted deployments should use a managed PostgreSQL service and a private connection string.
