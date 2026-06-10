# Fresh Chat Context

## Start Message To Paste

```text
Pracujemy w repo `/home/grzegorzszyda/Projekty/poo-of-shame`, branch `rewrite`.
Projekt to rewrite Poo of Shame: prywatna biblioteka gier, katalog admina,
kupka/backlog i historia runow. Uzywamy Bun, React 19, Convex, Clerk.

Przeczytaj najpierw:
- `docs/current-state.md`
- `docs/next-chat-handoff.md`
- `docs/library-views.md`

Nie zaczynaj od zgadywania. Sprawdz lokalny stan repo (`git status`) i aktualny
kod. Pracujemy malymi krokami, ale z porzadnym modelem danych. Po zmianach
uruchamiaj `bun run check`, commituj i pushuj na `origin/rewrite`.

Najblizszy task: zaczac widoki biblioteki po migracji. Priorytet:
1. `Wszystkie` z filtrowaniem i limitem/stronicowaniem.
2. `Kupka` bez statusu `playing`.
3. `Gram Teraz` po `gameRuns.status = playing`.
4. `Historia` z wyborem roku.
5. `Premiery`: moje premiery i katalogowe.

Najlepiej zacznij od issue #15 albo #20:
- #15: Dodać widok Wszystkie z filtrowaniem i stronicowaniem.
- #20: Przebudować bibliotekę na zakładki widoków.

Ważne decyzje:
- `libraryEntries` to legacy. Nie usuwać.
- Migracja legacy biblioteki została przygotowana i uruchomiona przez użytkownika.
- Nowy model: `userGames`, `gameRuns`, `gameAccess`.
- Historia grania wynika z `gameRuns`, nie z samego `userGames.status`.
- `Kupka` ma pokazywać `wanted` i `owned`, bez `playing`.
- Ocena jest per run.
- `pinnedRunId` ma być głównym runem, fallback to `lastRunId`.
- Backend ma mieć query pod konkretne widoki, a nie pobierać wszystko i filtrować
  klientem.
```

## Current State Summary

- Repo: `GrzegorzSzyda/poo-of-shame`.
- Local path: `/home/grzegorzszyda/Projekty/poo-of-shame`.
- Branch: `rewrite`.
- Remote: `origin/rewrite`.
- Latest pushed commit at handoff time: `7b81645 Document post-migration library views`.
- Worktree should be clean after this handoff.

## Implemented

- Convex + Clerk restored in rewrite.
- Admin panel:
    - `/admin/games`
    - `/admin/users`
    - `/admin/integrations`
    - `/admin/migration`
- Admin game catalog:
    - create/list/edit/delete games,
    - IGDB suggestions,
    - cover upload via URL,
    - duplicate prevention by normalized title + release key.
- User library:
    - search catalog,
    - add to `userGames`,
    - edit status/interest inline,
    - remove when no dependent runs/access records exist.
- Runs:
    - create/edit/delete inline,
    - rating and note per run,
    - flexible start/finish dates: `unknown`, `exact`, `year`, `quarter`, `month`, `text`,
    - quick suggestions from game status to run action,
    - delete keeps `lastRunId`/`pinnedRunId` consistent.
- Legacy migration:
    - `/admin/migration` previews and runs batches,
    - maps `libraryEntries` to `userGames`, `gameRuns`, `gameAccess`,
    - marks legacy entries with `migratedToUserGameId` and `migratedAt`,
    - does not delete `libraryEntries`.
- Docs:
    - `docs/library-views.md` defines post-migration views.

## Key Files

- `convex/schema.ts`: schema.
- `convex/library.ts`: user library and run query/mutations.
- `convex/migrations.ts`: admin-only legacy migration.
- `convex/games.ts`: catalog/admin game functions.
- `convex/admin.ts`: roles/admin checks/IGDB settings.
- `src/pages/LibraryPage.tsx`: current single-page library UI.
- `src/pages/AdminPage.tsx`: admin tabs.
- `src/features/admin/LibraryMigrationPanel.tsx`: migration UI.
- `docs/library-views.md`: planned views.
- `docs/current-state.md`: current project state.
- `docs/next-chat-handoff.md`: ongoing handoff.

## Open GitHub Issues For Views

- #15 `Dodać widok Wszystkie z filtrowaniem i stronicowaniem`
- #16 `Dodać widok Kupka bez aktywnie granych gier`
- #17 `Dodać widok Gram Teraz oparty o aktywne runy`
- #18 `Dodać widok Historia z wyborem roku`
- #19 `Dodać widoki Premiery: moje i katalogowe`
- #20 `Przebudować bibliotekę na zakładki widoków`

## Suggested Next Move

Start with #20 only if the UI needs structural cleanup first. Otherwise start
with #15 and implement the smallest useful version of `Wszystkie`:

- add library view tabs,
- keep current list as `Wszystkie`,
- add backend query for filtered/paged library rows,
- add title search,
- add status filter,
- add has-run/no-run filter,
- avoid client-side filtering of all rows.

Then implement #16 `Kupka` using its own query for `wanted` + `owned`, sorted by
`interest desc` then `updatedAt desc`.

## Verification

Standard command:

```bash
bun run check
```

Notes:

- `bun run check` runs Convex codegen and can sometimes leave a format-only diff
  in `convex/_generated/api.d.ts`. If the diff is only generator formatting and
  not functional, restore it before committing unrelated docs.
- Do not delete or reset data.
- Do not remove `libraryEntries` yet.
