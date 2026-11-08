# Maviri — Final Website Draft

**Status:** Step 8 — consolidated product, experience, and prototype draft  
**Purpose:** Turn the original website prompt and discussion history into one buildable definition of Maviri, while showing which parts are already in the first prototype and which remain later work.

## 1. How the brief was reconciled

The supplied implementation plan names six phases and no step 8. The discussion history also does not define a step 8. For this request, Step 8 is therefore the final website draft and the prototype scope review requested here.

The direct project instructions from the conversation take precedence where they conflict with the longer prompt:

- Use live AniList data; do not replace it with invented catalogue fixtures.
- Build a real site and persistent backend, not a static concept.
- Keep clean routes such as `/anime/21`, never file-name routes such as `/index.html`.
- Use distinct component classes and IDs, CSS variables, and no inline styles or injected HTML.
- Preserve the supplied Maviri mark and make the product feel original.

The product remains anime discovery, personal tracking, and community. It is not a streaming service. Polls are outside the initial scope. Anime catalogue records come from AniList; Maviri stores user activity and community data.

## 2. Product definition

Maviri is a personal anime space where a person can find a story, keep a record of watching it, and meet people through the conversations around it. Discovery, library, and community should feel like parts of one product rather than three separate applications.

The experience combines:

- Precise search and useful anime information for people who already know what they want.
- Human and community signals that help people discover something unexpected.
- Fast, private-by-default personal tracking.
- A mixed community feed for short thoughts, media, discussions, reviews, and quotes.
- Profiles that express their owners while remaining safe and accessible.

The design should be expressive, mature, warm, and interactive. It should not copy AniList, MyAnimeList, Instagram, X, Reddit, Steam, Discord, or a reference design.

## 3. Visual direction

### Identity

Use the supplied Maviri mark as the recognizable brand anchor. Pair expressive display typography with compact monospaced labels and calm, readable body text. Favor unexpected compositions, confident whitespace, print-inspired details, and small tactile interactions. Do not make every section a card or every page an editorial layout.

### Themes

**Colorful Paper light theme**

- Paper `#FFF5E8`
- Ink `#292522`
- Butter `#F3D36A`
- Matcha `#9DBD91`
- Lilac `#C5A0D5`

**Warm Charcoal dark theme**

- Background `#141110`
- Surface `#211A18`
- Raised surface `#342420`
- Text `#F2E5D8`
- Amber `#D69B54`
- Rose `#BF7893`

Keep CSS custom properties as the source of truth. Avoid blue-tinted dark backgrounds, purple/blue gradients, tomato, orange, and coral accents. Both themes should have their own mood, readable contrast, visible focus states, and the same content hierarchy.

### Interaction and accessibility

Use motion to clarify hierarchy or make an interaction memorable. Respect reduced-motion preferences. Load WebGL only where it supports a real task and provide an accessible data view when WebGL is unavailable or inappropriate. All actions need visible labels, keyboard access, and clear success and error feedback. Forms should not depend on placeholder text for instructions.

## 4. Site map and page draft

| Route | Purpose and primary content |
|---|---|
| `/` | Live trending anime, a useful discovery entry point, and community activity for signed-in users. Logged-out visitors get real catalogue content and clear paths to discovery and account creation. |
| `/discover` | Live AniList search and trending titles. Grow into guided discovery with genre/tag, format, season/year, popularity, and community signals. |
| `/anime/[id]` | Dedicated anime record: artwork, titles, synopsis, format, season/year, genres, score, characters, studios, related titles, discussions, and reviews. |
| Anime quick edit | Compact, in-context tracker controls for status, episode progress, score, and lists; it must stay distinct from the full anime page. |
| `/library` | Personal collection with watching, completed, planning, paused, and dropped statuses; custom lists; progress, rating, dates, notes, sorting, and filters. |
| `/library/stats` | Collection totals, episode progress, status distribution, and a selective interactive 3D view backed by that user’s real library. |
| `/community` | One mixed feed for text, image/media, anime-linked posts, discussions, reviews, reposts, and quotes. The feed should balance relevance, recency, followed accounts, anime interests, and author diversity. |
| `/community/[postId]` | Focused discussion with threaded replies, useful/highlighted responses, anime context, reactions, and reporting. Avoid a generic forum treatment. |
| Anime review section | Dedicated review reading and writing with score, spoiler protection, helpful reactions, sorting, attribution, and edit/delete controls. Reviews can also appear in the community feed without duplicate entries. |
| `/profile/[username]` | Public personal space: identity, chosen sections, selected library/stats, activity, reviews, pinned posts, artwork, and links. Owners control visibility and layout. |
| `/settings/profile` | Safe customization editor with preview and reset. Appearance and layout are configured from approved settings; user HTML and scripts are never executed. |
| `/bookmarks` | Saved community posts. |
| `/notifications` | Read/unread activity for follows, replies, reactions, reposts, mentions, and review/discussion activity, with controls to prevent repetitive noise. |
| `/moderation` | Role-protected queue, decisions, and moderation history. Administrative actions must be checked on the server. |
| `/sign-in` | Account creation and sign-in. |

The main navigation stays recognizable across screen sizes: Home, Discover, Community, My Library, Search, Notifications, and Profile. On mobile it becomes a compact, horizontally usable navigation rather than disappearing.

## 5. Core user journeys

### Find and track a title

1. Search or browse current AniList results.
2. Open a clean `/anime/[id]` route to inspect the title and related works.
3. Add it to a library status or open the quick-edit panel without losing the current page.
4. Update episodes, score, dates, notes, rewatch count, or a custom list.
5. See those saved values reflected in the library and personal statistics.

### Join the community

1. Register and receive a persistent account/session.
2. Follow people and browse the ranked community feed.
3. Create a thought, discussion, review, image-link, anime-linked, or quote post.
4. Reply in a thread, react, repost, bookmark, or report content.
5. Receive relevant activity notifications and manage profile visibility.

### Customize and moderate

1. Edit a public profile using safe theme and media settings.
2. Preview changes before saving and restore defaults at any time.
3. Report content from its post or discussion context.
4. A moderator reviews the report, records a decision, and can remove content.
5. A normal member cannot access moderator actions by changing the UI or calling the API directly.

## 6. Data and application architecture

Use a TypeScript modular monolith: Next.js App Router for pages, server-rendered data, and API route handlers; PostgreSQL and Prisma for user-owned persistent data; Better Auth for sessions and credentials; and a provider boundary around the AniList GraphQL client. Keep business/data-access logic out of presentation components where a reusable service makes the boundary clearer.

Current persistent domains include users, sessions/accounts, anime list entries, custom lists, posts, comments, reactions, bookmarks, reposts, follows, notifications, reports, and moderation actions. AniList catalogue metadata is requested live and is not copied into the application database. The local Windows development setup provisions a separate PostgreSQL cluster under the current user's local app data, stores its generated secrets in ignored `.env.local`, and applies migrations automatically when the dev server starts. Production uses an externally provisioned PostgreSQL service and secret manager.

Current AniList access is server-side. Trending, search, batch, and detail queries use short revalidation windows, identical in-flight calls are coalesced, requests are paced using the provider's rate-limit headers, and recently fetched results can be served briefly while the provider is throttling or unavailable. Catalogue data is still fetched from AniList rather than mirrored into PostgreSQL. A distributed rate limiter and provider-volume testing remain production-scale work.

## 7. First prototype: what is working now

The current prototype includes:

- Next.js, TypeScript, Tailwind, clean App Router links, a responsive Maviri shell, logo, CSS-variable themes, and the body-attribute hydration suppression for browser extensions.
- Live AniList trending/search/detail routes and server API endpoints.
- Better Auth email/password accounts connected to a real local PostgreSQL database.
- Persistent library entries and custom lists, including status, progress, score, dates, notes, and rewatch count.
- Community posts, threaded replies, likes, reposts, bookmarks, follows, reports, and personalized ranking signals based on follows and anime already in the user’s library.
- Basic public profiles and editing for username, bio, HTTPS avatar/banner URLs, and a small safe theme set.
- Notifications, post moderation, role checks, and moderation action history.
- Real-data library statistics with a lazy-loaded draggable Three.js view on suitable desktop browsers and an accessible lightweight view elsewhere.
- `/api/health`, loading/not-found/error UI, security headers, a backend smoke-check script, and deployment notes.

The backend smoke check has verified account registration, library persistence, custom-list creation, post creation, member moderation denial, statistics rendering, and database health. The production build, TypeScript check, lint, and production dependency audit have passed.

## 8. Remaining work before calling the full product production-ready

These items belong to the complete product vision but are not represented as finished features in this prototype:

1. **Dedicated review system:** a review data model/page, spoiler reveal controls, helpful reactions, sorting, and review ownership tools. A review-flavored post is not a substitute for this.
2. **Real media uploads:** validated storage for avatars, multi-image posts, galleries, and video delivery. The current social image flow accepts an HTTPS URL; it is not an upload service.
3. **Profile depth:** rearrangeable widgets/sections, background and pattern controls, media gallery, live profile preview/reset, and optional 3D avatar-provider integrations with static fallbacks.
4. **Discovery breadth:** genre/tag and format/season/year filtering, recommendations, upcoming/seasonal views, and richer character/studio/staff exploration.
5. **Community safety:** blocking/muting, user/comment reports, suspensions/bans, spam throttling, episode-aware spoiler controls, and sensitive-content preferences.
6. **Real-time social delivery:** the current feed and notifications load from the backend on page requests; instant WebSocket or push delivery and background fan-out are not implemented. Add polling or a real-time transport only with a clear freshness and infrastructure decision.
7. **Account privacy:** user data export/deletion, notification preferences, and explicit visibility controls for library/activity.
8. **Production operations:** automated browser coverage for mobile and key flows, load/query profiling on representative data, external API outage/rate-limit scenarios, backups/restore checks, and hosted deployment secrets.

Do not fill these gaps with seeded anime or fabricated community activity. Build each from real provider data or actual user actions, with a truthful empty state while no data exists.

## 9. Acceptance bar for future changes

- Every visible action reaches a working page or a working server operation.
- User-generated data is validated, scoped to its owner, and persisted in PostgreSQL.
- Role and ownership checks run on the server.
- AniList-derived facts are displayed as provider data and are never invented.
- Slow, empty, failed, signed-out, and permission-denied states are designed, not hidden.
- Layouts work on desktop and mobile; keyboard focus, contrast, labels, and reduced motion are preserved.
- 3D is lazy-loaded, optional, and backed by a non-WebGL alternative.
- Routes use readable path names; components use distinct class/ID names; styling uses CSS variables without inline styles or arbitrary user HTML.
- Database changes are migrated and deployment instructions are updated.

## 10. Final draft decision

Maviri’s first prototype is a live, persistent anime discovery and community application with its own warm print-inspired visual identity. Its current center is AniList discovery, a real personal tracker, and a unified community surface. The next product increments should close the explicit gaps above—especially reviews, uploads, fuller profile customization, discovery filters, community safety, and delivery/operations—without replacing genuine content with placeholders or turning the product into a clone of its references.
