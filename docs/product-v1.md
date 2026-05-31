# Poo of Shame Rewrite: V1 Notes

## Direction

The app is a personal game library and play tracking tool.

It should cover:

- a game catalog maintained by admins,
- a user library built from that catalog,
- multiple runs/playthroughs per game,
- history of what was played in a month or year,
- stats and charts later,
- backlog and current-play tracking,
- ratings, notes, and ownership/platform metadata.

It is not intended to be a social app in V1.

## Existing Data

The rewrite must keep using Convex.

The existing Convex database already contains 1000+ game records, so the rewrite
must avoid destructive resets. Schema changes should be planned as additive
migrations first, with cleanup only after data is safely moved.

## First Product Slice

The dashboard is not the first feature.

The first useful slice is:

1. Admin can add games to the shared catalog.
2. User can add catalog games to their own library.

This creates the minimum foundation for every later feature:

- currently playing,
- games finished this year,
- playthrough/run history,
- yearly/monthly stats,
- charts,
- backlog prioritization.

## Initial Domain Model

The old app mostly had:

- `games`
- `libraryEntries`

The rewrite should split the model more deliberately:

- `games`: shared catalog record.
- `userGames`: user's relationship to a game.
- `gameRuns`: one playthrough/run of a user game.
- `gameRunEvents` or `playEvents`: optional future event log for status changes,
  sessions, completions, abandonments, and dates.

This matters because one game can have many runs. A single `progressStatus` on a
library entry is not enough once the app needs yearly/monthly history.

## Suggested V1 Data Shape

### `games`

Shared admin-managed catalog.

- title
- normalized title
- release date or year
- cover image
- external ids later, for example IGDB

### `userGames`

User-owned library item.

- user id
- game id
- ownership/platforms
- backlog status
- priority or interest
- notes
- timestamps

### `gameRuns`

One run/playthrough.

- user id
- user game id
- game id denormalized for querying
- status: planned, playing, completed, dropped
- started at
- finished at
- rating
- notes
- timestamps

## Convex Concerns

Convex can still work for V1, but the backend must be designed around views
instead of generic "fetch and filter later" queries.

Needed query patterns:

- admin catalog list/search,
- user catalog search for adding to library,
- user library by status,
- active runs by user,
- completed runs by year/month,
- dashboard summary later.

The important rule: do not paginate first and then filter/sort in memory. Queries
should use indexes that match the product views.

## Next Implementation Step

Restore Convex into the new app in a minimal way:

1. Bring back only the Convex provider/config needed to connect.
2. Bring back a minimal `games` backend based on the existing data.
3. Build an admin "Add game" flow.
4. Build a user "Add to library" flow from existing catalog games.

Do not bring back the old layout, old dashboard, old cheats pages, or old large
component tree.
