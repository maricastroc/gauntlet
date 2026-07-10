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
| `/` | **Overview** | Answers "what needs my attention now" — live match, next decider, the tightest group. |
| `/standings` | **Standings** | Every group table, with qualification zones and explicit tiebreak notes. |
| `/bracket` | **Bracket** | The signature screen — knockout rounds threaded by CSS connectors, live/penalty/TBD states, the trophy. |
| `/console` | **Console** | Edit a result; the standings projection recomputes live and previews the delta before you commit. |

## Architecture

```
src/
  app/(app)/…        route group; shared shell (rail + topbar + phase pills)
  components/         shell · bracket · standings · overview · console · ui
  lib/
    types.ts          UI domain model
    format.ts         round names, ordinals, goal-difference display
    standings.ts      pure standings projection (mirrors the API's GroupTable)
    api/client.ts     live API client (raw response types + mappers)
    data/             "Copa Atlas 2026" demo fixtures (mirrors the API seeder)
```

**The data seam.** Screens read from `src/lib/data`, which today composes demo
fixtures. To go live, point those functions at `src/lib/api/client.ts` — the
return shapes are identical, so no component changes. Set the API base URL with
`NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000/api`).

## Running

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```
