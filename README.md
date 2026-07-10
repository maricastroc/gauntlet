# tournament-game (frontend)

The operator UI for [`tournament-game-api`](../tournament-game-api) — a premium
tournament-management product. The thesis of the API is that **state is a
projection, not a stored value**: standings, tiebreaks and knockout advancement
are *derived* from match results. This frontend makes that legible — you edit a
score and watch the table reorder before it's saved.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind v4**.

## Design

A dark "stadium at night" surface, a single amber accent, gold reserved for the
champion. Typography does the heavy lifting — **Fraunces** (serif titles),
**Geist** (sans UI), **Geist Mono** (every number). All tokens live in
[`src/app/globals.css`](src/app/globals.css) under `@theme`. The visual
reference is the API's `docs/mocks/bracket-mocks.html`.

Four screens:

| Route | Screen | What it does |
|-------|--------|--------------|
| `/` | **Overview** | Answers "what needs my attention now" — next decider, the tightest group, live stats. |
| `/standings` | **Standings** | Every group table, with qualification zones and explicit tiebreak notes. |
| `/bracket` | **Bracket** | The signature screen — knockout rounds threaded by CSS connectors, penalty/TBD states, the trophy. |
| `/console` | **Console** | Edit a result; the projection previews the delta, then a real optimistic-locked write saves it. |
| `/login` · `/register` | **Auth** | Organizer sign-in / sign-up (Sanctum token). Reading is public; signing in unlocks the console, and only the tournament owner can save. |

## Architecture

```
src/
  app/(app)/…        route group; shared shell (rail + topbar + phase pills)
  app/login/         organizer sign-in
  components/         shell · bracket · standings · overview · console · ui
  lib/
    types.ts          UI domain model
    format.ts         round names, ordinals, goal-difference display
    standings.ts      pure standings projection (mirrors the API's GroupTable)
    auth/             session context (token in localStorage, useAuth)
    api/client.ts     live API client (unwraps {data}, auth, submit; typed errors)
    data/
      live.ts         live source: fetch + enrich (PT→English names, flags)
      copa-atlas.ts   "Copa Atlas 2026" demo fixtures (mirrors the API seeder)
      index.ts        public reads: try live, fall back to demo
```

**The data seam.** Reads (`getGroups`, `getBracket`, `getOverview`) try the
live API first and fall back to the demo fixtures if it's unreachable, so the UI
renders with or without the API. Team names arrive in Portuguese and are
enriched to English + flags via a catalog keyed by team id. The Console performs
a real, optimistic-locked `PUT` when signed in.

The API surface is thin, so some texture stays local: the API has no tournament
metadata, fixtures, live-match or per-side knockout-score endpoints. Fully-live
Overview/Console-preview would need those added upstream.

## Configuration

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api   # default
NEXT_PUBLIC_USE_LIVE_API=true                         # set "false" to force demo
```

## Running

Point it at the companion API (seeded):

```bash
# in ../tournament-game-api
php artisan migrate:fresh --seed     # demo organizer: demo@bracket.test / password
php artisan serve                    # http://localhost:8000

# here
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```
