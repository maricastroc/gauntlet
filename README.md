# Gauntlet (frontend)

**Gauntlet** — run the bracket, lift the cup. The operator UI for
[`gauntlet-api`](../gauntlet-api) — a premium
tournament-management product. The thesis of the API is that **state is a
projection, not a stored value**: standings, tiebreaks and knockout advancement
are _derived_ from match results. This frontend makes that legible — you edit a
score and watch the table reorder before it's saved.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind v4**.

## Design

A dark "stadium at night" surface, a single amber accent, gold reserved for the
champion. Typography does the heavy lifting — **Fraunces** (serif titles),
**Geist** (sans UI), **Geist Mono** (every number). All tokens live in
[`src/app/globals.css`](src/app/globals.css) under `@theme`. Every navigation
re-mounts the screen for a gentle, reduced-motion-safe rise. The visual
reference is the API's `docs/mocks/bracket-mocks.html`.

## Screens

| Route                      | Screen             | What it does                                                                                                                                               |
| -------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                        | **Overview**       | Answers "what needs my attention now" — next decider, the tightest group, live stats.                                                                      |
| `/standings`               | **Standings**      | Every group table — qualification zones, tiebreak notes, and a per-team forecast (clinched / out / % to advance).                                          |
| `/bracket`                 | **Bracket**        | The signature screen — a _playable_ knockout (tap a tie, enter the score, the winner advances to the trophy) topped by a Monte-Carlo "title race".         |
| `/console`                 | **Console**        | Edit a result; the projection previews the delta, then a real optimistic-locked write saves it.                                                            |
| `/what-if`                 | **What if?**       | Pin hypothetical results and watch the standings — and the whole bracket — re-project; a shareable, zero-persistence scenario with a propagation timeline. |
| `/tournaments`             | **Tournaments**    | Every tournament you run — open one to view it across the app, or delete it. A sample tournament is always shown.                                          |
| `/tournaments/new`         | **New tournament** | A three-step wizard — name it, add teams, split into groups — that generates the fixtures and the bracket.                                                 |
| `/tournaments/[id]/manage` | **Manage**         | Rename the tournament and its teams after creation — safe edits; results, standings and the bracket are keyed by id, so they stay intact.                  |
| `/login`·`/register`       | **Auth**           | Organizer sign-in / sign-up (Sanctum token). Reading is public; signing in unlocks the console and tournament management, and only the owner can save.     |

## Features

- **Live standings projection.** Group tables are computed from raw results, not
  stored — points, goal difference, form and the qualification cut recalculate
  on every read. The tiebreak that separates two level teams is spelled out in
  plain language, and the front-end engine mirrors the API's tiebreak chain —
  head-to-head included — pinned by a shared conformance suite so the two can't drift.
- **Playable knockout.** Rounds flow left→right, CSS connectors thread each
  winner forward, and the final feeds the trophy column. It's not just a view:
  tap any tie to enter the score — a penalty shootout appears on a draw — and the
  winner advances through the tree to a crowned champion, with a live preview of
  who they'll face next. Editing an upstream result cascades down the bracket, so
  it's never left partial. Results persist through the same optimistic-locked
  match endpoint as the group stage (it branches on the tie; a stale edit 409s).
  Hover any team to trace its **road to the final** — its ties and the slots
  ahead light up, the rest of the tree dims.
- **Forecast & odds.** A server-side Monte-Carlo turns the tables into a live
  story. `/bracket` carries a **title race** — each surviving side's chance to
  lift the trophy, simulated over the remaining knockout. `/standings` tags every
  team **clinched**, **out**, or a live **% to advance**, from simulating each
  group's remaining games. A seeded RNG keeps the numbers stable until a real
  result moves them.
- **The Console.** Pick a match, dial each side's score, and the group table on
  the right previews the exact reorder — rows _animate_ into their new place, each
  team tagged mathematically **through** or **out**, and the games that still decide
  the group flagged. Confirming performs an atomic, optimistic-locked `PUT`
  (`expected_version`; a stale edit 409s rather than clobbering) — then a **"what
  your result caused"** summary names every clinch, elimination and bracket slot it
  moved, and the rest of the app refreshes so nothing goes stale.
- **Replay how it happened.** On `/standings`, expand any group to replay its table
  result by result — scrub, or hit play, and watch the rows rebuild into the final
  order (the same re-project-over-prefixes the engine already does).
- **What if? scenarios.** `/what-if` pins hypothetical results and re-projects the
  whole tournament without saving a thing — a group result reshuffles the
  standings _and_ reseeds the bracket, exactly the cascade the API's engines
  already compute. A **propagation timeline** narrates each consequence in order
  ("Japan rises to 1st", "Brazil replaces Japan in the quarterfinals", "New
  champion: …"), and the entire scenario lives in the URL, so a link reproduces
  it. Works offline too: when the API is unreachable it projects the demo
  tournament client-side.
- **Multi-tournament management.** Signed-in organizers get a gallery of their
  tournaments and a build wizard: name the tournament, enter teams (with flags,
  pre-seeded with a suggested roster), then choose the group count, how many
  advance per group, and whether to generate the knockout — with a live
  round-robin preview of the draw. Opening a tournament switches the whole app
  to it; the demo tournament can always be browsed but never deleted. After a build,
  a **Manage** screen renames the tournament and its teams (flags included) — safe
  edits, since everything downstream is keyed by team id, not name, and only the
  owner sees it.
- **Isolated demo sandbox.** Signing in as the demo organizer no longer edits
  shared data. The API clones the sample tournament into a private, per-session
  copy and login switches the app to it (via the current-tournament cookie), so
  results persist across refreshes and navigation but never collide with another
  visitor. A **Reset** control in the topbar restores a clean tournament; the copy
  expires after a day. Spectators still see the pristine template, read-only.
- **Auth & ownership.** Reads are public, so anyone can browse. A Sanctum bearer
  token (kept in `localStorage`, validated on mount) unlocks owner actions —
  saving a result, building and deleting tournaments.
- **Works with or without the API.** Reads try the live API first and fall back
  to the bundled "Atlas Cup 2026" demo when it's unreachable, so the UI always
  renders.

## Architecture

```
src/
  app/(app)/…          route group; shared shell (rail + topbar + phase pills)
    tournaments/       the tournament gallery + new/ (the build wizard)
  app/login/ register/ organizer auth
  components/          shell · bracket · standings · overview · console · forecast · tournaments · ui
  lib/
    types.ts           UI domain model
    format.ts          round names, ordinals, goal-difference display
    standings.ts       pure standings projection (mirrors the API's GroupTable)
    knockout.ts        pure knockout resolver (advancement, penalties, champion, road-to-final)
    console.ts         console preview helpers (raw matches → standings delta)
    forecast/          Monte-Carlo odds — seeded RNG, model, group + bracket sims
    whatif/            scenario URL codec + cascade (diff → propagation narrative)
    hooks/             useScenario (pins → projection), useStandings, useRequest
    auth/              session context (token in localStorage, useAuth)
    api/client.ts      live API client (reads, auth, tournament CRUD, result + scenario)
    tournament/        current-tournament cookie (server + client) + draft/build helpers
    data/
      live.ts          live source: fetch + enrich (PT→English names, flags)
      scenario.ts      what-if reads: live scenario projection + fallback wiring
      demo-scenario.ts offline what-if projector (client-side cascade for the demo)
      copa-atlas.ts    "Atlas Cup 2026" demo fixtures (mirrors the API seeder)
      index.ts         public reads: try live, fall back to demo
```

**The data seam.** Reads (`getGroups`, `getStandingsView`, `getBracket`,
`getOverview`, `getConsoleGroups`, `getWhatIfSetup`) take a tournament id and try the live API first, falling
back to the demo fixtures for the demo tournament (id 1) when the API is
unreachable; other tournaments return safe-empty so nothing crashes. The
what-if projection follows the same seam — `projectScenario` posts to the live
scenario endpoint and falls back to an offline client-side projector for the demo. Team names
arrive in Portuguese and are enriched to English + flags via a catalog keyed by
team id. The **current tournament** is held in a server-readable cookie so the
SSR screens know which tournament to render without a client round-trip.

Knockout results are live too: the bracket is edited in place and saved through
the same optimistic-locked match endpoint as the group stage (it branches on the
tie), and each side's score is read from the knockout fixtures on the tournament
detail and merged onto the resolved bracket. The forecasts run server-side over
that same data. One bit of texture stays local — the API has no live-match /
kickoff endpoint, so the Overview's "live now" card is still demo-fed.

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
```

## Tooling

```bash
npm run lint          # ESLint (next core-web-vitals + typescript, prettier-aware)
npm run format        # Prettier — write
npm run format:check  # Prettier — verify, no writes
```

ESLint and Prettier are kept in separate lanes: `eslint-config-prettier` turns
off any stylistic rules that would fight the formatter, so `npm run lint` judges
code quality and `npm run format` owns whitespace and indentation.
