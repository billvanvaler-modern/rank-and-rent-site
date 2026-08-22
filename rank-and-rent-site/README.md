# Rank & Rent CMS — Public Site (v1: service pages)

The public-facing Next.js app that renders the content built in the admin
CMS. Separate app, separate deployment from the admin — this one has no
login and no write access to Supabase at all; it only reads published
content through the anon key, relying entirely on RLS
(`001_initial_schema.sql`) to keep drafts and paused sites hidden.

## One-time setup

1. `npm install`
2. `.env.local` is already filled in with the project URL and anon key —
   nothing secret to add here (there's no service role key in this app on
   purpose).
3. `npm run dev`, then visit `http://localhost:3000`.

Locally, and on a Vercel preview URL before a real domain is attached, the
`Host` header won't match any row in the `sites` table. `DEV_DEFAULT_DOMAIN`
in `.env.local` (currently `noblesvilleroofer.com`) is what the app falls
back to in that case, so you see real content instead of a "no site
configured" page. Once a real custom domain is attached and its DNS points
here, that domain resolves on its own and this fallback is never consulted
— it's dev/preview-only.

## What's here

- **Multi-tenant by domain** — one deployment, any number of `sites` rows.
  `src/lib/data.ts`'s `getCurrentSite()` reads the request's `Host` header
  and looks up the matching `sites.domain`.
- **`/`** — the site's `home` page, rendered from its blocks if one exists
  and published; otherwise a plain "hasn't been published yet" placeholder
  (distinct from a real 404 — the site itself is real, it just has no
  homepage content yet).
- **`/services`** — the `services_hub` page: its own blocks (if any) plus a
  list of its published child service pages.
- **`/services/[slug]`** — a service page: renders every block in order,
  generates the page `<title>`/description/Open Graph tags from
  `meta_title`/`meta_description` (falling back to the page's headline +
  business name), and emits a `Service`/`LocalBusiness` JSON-LD block from
  the site's NAP fields — no per-page authoring needed for any of that.
- **`sitemap.xml` / `robots.txt`** — generated per-domain from whatever
  pages are actually published for that site.
- **`BlockRenderer`** (`src/components/BlockRenderer.tsx`) — renders every
  block_type the schema defines, not just the ones a service page uses. The
  heading level (H1/H2/H3) is fixed per block_type in this component, which
  is what actually enforces PROJECT.md's "content editors can change text,
  never structure" rule — the database has no opinion on headings, this
  file does.

## Why some things are built the way they are

- **Separate app from the admin, on purpose.** Different security posture
  (no auth needed here, no write access at all), different deploy target
  (this one gets the real customer domains attached to it; the admin stays
  on its own Vercel subdomain), different caching/perf characteristics.
  Mixing them would mean the public site's routes sit behind the same
  proxy/auth logic as the admin for no benefit.
- **Anon key only, no service role key.** This app has no reason to ever
  write, so it simply can't — RLS already filters to published/active rows,
  which means the queries here don't re-implement that filtering themselves
  (one less place for a status check to drift out of sync with the schema).
- **`BlockRenderer` covers every block_type already**, including ones no
  admin screen produces yet (`hero`, `services_grid`, `differentiators`,
  etc.) — the content contracts were already fully specified in
  `001_initial_schema.sql`'s comments, so building the renderer for all of
  them now costs little and means the homepage and location-page admin
  screens (next up per PROJECT.md) won't need a matching public-site change
  when they land.
- **`link_page_id` inside block content resolves through an optional
  `pageHrefById` map**, not automatically. No block type a service or
  services-hub page actually uses (`page_intro`, `body_section`,
  `pricing_table`, `faq`, `final_cta`) needs it, so it's untested here —
  `services_grid` and `related_links` items degrade to plain text without a
  map. Building real cross-page link resolution is follow-up work once a
  page type that needs it (the homepage's services grid) actually exists.

## What this build deliberately doesn't do yet

- No location pages, about, or contact routes — no admin screen produces
  that content yet either.
- No real contact form — `contact_info` blocks render hours/map but the
  form itself isn't wired up.
- No image optimization (`next/image`) — images render via plain `<img>`
  pointing at the public Storage URL. PROJECT.md calls out
  resizing/formatting as template-level work; worth doing before real launch
  traffic, not required to prove the schema renders correctly.
- No ISR/caching tuning — every route is fully dynamic (server-rendered per
  request) since it varies by `Host` header. Fine for now; worth revisiting
  once there's real traffic to think about caching per-domain.

## Verifying this actually works

Same approach as the admin app: this sandbox has no network route to
Supabase, so `npm run dev` here can't hit the live database directly.
Verification instead used fixture data that mirrors the actual
"Noblesville Roofer" / "Roof Replacement" rows in the live database,
rendered through the real components, and screenshotted. That process
caught a real bug — the service page's title was rendering doubled
("... Noblesville Roofing Co. | Noblesville Roofing Co.") because its
fallback title already included the business name, and the root layout's
title template appended it a second time on merge. Fixed by having the
service page's metadata opt out of the layout's title template
(`title: { absolute: ... }`) instead of composing with it. `npm run build`
and `npm run lint` both pass clean, and all temporary fixture/mock code was
reverted before this zip was built — nothing in this app talks to anything
but the real Supabase project.

What wasn't possible from here: an actual click-through against the live
database in a real browser. That's on you once this is deployed and pointed
at a real domain (or the Vercel preview URL, using the `DEV_DEFAULT_DOMAIN`
fallback above).
