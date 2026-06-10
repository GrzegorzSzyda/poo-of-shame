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
- `gameAccess`: user's access/ownership source for a game.
- `gameRuns`: one playthrough/run of a user game.
- `gameRunEvents` or `playEvents`: optional future event log for status changes,
  sessions, completions, abandonments, and dates.

This matters because one game can have many runs. A single `progressStatus` on a
library entry is not enough once the app needs yearly/monthly history.

## Suggested V1 Data Shape

### `games`

Shared admin-managed catalog.

- `title`
- `titleNormalized`
- `releasePrecision: exact | year | quarter | month | text | unknown`
- `releaseKey`
- `releaseDate?`
- `releaseYear?`
- `releaseQuarter?`
- `releaseMonth?`
- `releaseText?`
- `releaseYearMonth?`
- `coverImageUrl?`
- `createdAt`
- `updatedAt`

### `userGames`

User's "kupka" entry for a catalog game. This can mean the user owns the game,
wants to get it, is currently playing it, has completed it, mastered it, or
dropped it.

- `userId`
- `gameId`
- `status: wanted | owned | playing | completed | mastered | dropped`
- `interest: number` (`0..100`)
- `note?`
- `pinnedRunId?`
- `lastRunId?`
- `createdAt`
- `updatedAt`

No `priority` field in V1. `interest` is enough until there is a proven need for
a second sorting axis.

### `gameAccess`

User's concrete access to a game. This is separate because "having a game" is
not binary: a game can be owned, available through a subscription, unavailable
because the subscription lapsed, present on disc, or only wished for.

- `userId`
- `userGameId`
- `gameId`
- `platform: pc | playstation | xbox | switch | mobile | other`
- `source:
steam | gog | epic | ea_app | ubisoft_connect | amazon_gaming | ps_store |
ps_plus | ps_disc | xbox_store | game_pass | switch_eshop | switch_card |
pc_disc | other`
- `accessType: owned | subscription | borrowed | wishlist | unknown`
- `isAvailable`
- `note?`
- `createdAt`
- `updatedAt`

### `gameRuns`

One run/playthrough.

- `userId`
- `userGameId`
- `gameId` denormalized for querying
- `status: planned | playing | completed | mastered | dropped`
- `label?`
- `runType?: first_playthrough | replay | new_game_plus | dlc | challenge |
coop | other`
- `rating?: number` (`0..100`)
- `note?`
- `startedPrecision: exact | year | quarter | month | text | unknown`
- `startedDate?`
- `startedYear?`
- `startedQuarter?`
- `startedMonth?`
- `startedText?`
- `startedYearMonth?`
- `finishedPrecision: exact | year | quarter | month | text | unknown`
- `finishedDate?`
- `finishedYear?`
- `finishedQuarter?`
- `finishedMonth?`
- `finishedText?`
- `finishedYearMonth?`
- `createdAt`
- `updatedAt`

The primary displayed run for a `userGame` is `pinnedRunId` if set, otherwise
`lastRunId`. Displayed rating follows that selected run.

`libraryEntries` stays in the schema as legacy data until a migration is planned
and verified.

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

## Library Views After Migration

After migrating legacy `libraryEntries`, the app needs dedicated library views
instead of one large list.

Planned V1 views:

- `Kupka`: backlog view for `wanted` and `owned`; it intentionally excludes
  `playing`.
- `Gram Teraz`: active run view based on `gameRuns.status = playing`.
- `Historia`: yearly/monthly history based on `gameRuns`, grouped into started,
  completed, mastered, and dropped runs.
- `Premiery`: both user's release calendar and catalog-wide release calendar.
- `Wszystkie`: technical control view with filters for migration verification and
  cleanup.

Detailed scope is tracked in `docs/library-views.md`.

## Next Implementation Step

Current completed slice:

1. Convex and Clerk are restored in the rewrite.
2. Admin routes exist for games, users, and integrations.
3. Admin can add games to the shared catalog.
4. Admin can list, edit, and delete catalog games.
5. Admin can manage roles and store IGDB credentials.

Next product slice:

1. User can search the shared catalog.
2. User can add a catalog game to their own `userGames` library/kupka.
3. User cannot add the same game twice.
4. The app shows a minimal library view proving that the new model works.

Still do not bring back the old layout, old dashboard, old cheats pages, or old
large component tree.
