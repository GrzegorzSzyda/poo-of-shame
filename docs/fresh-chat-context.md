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
- `docs/fresh-chat-context.md`

Nie zaczynaj od zgadywania. Sprawdz lokalny stan repo (`git status`) i aktualny
kod. Pracujemy malymi krokami, ale z porzadnym modelem danych. Po zmianach
uruchamiaj `bun run check`, commituj i pushuj na `origin/rewrite`.

Widoki biblioteki po migracji juz sa:
- `Wszystkie`
- `Kupka`
- `Gram teraz`
- `Historia`
- `Premiery`

Aktualny fokus to dopracowanie tego, co juz jest:
1. UX i filtry `gameAccess`.
2. Weryfikacja migracji i repairu `wanted/rating` na realnych danych.
3. Ewentualne dodatkowe filtry/sortowanie w `Premiery`.
4. Porzadki/refaktor `src/pages/LibraryPage.tsx`, jesli zacznie przeszkadzac.

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
- W widokach agregujących akcje `userGame` są otwierane leniwie przyciskiem
  `Akcje`, a nie montowane od razu pod każdym rekordem.
```

## Current State Summary

- Repo: `GrzegorzSzyda/poo-of-shame`.
- Local path: `/home/grzegorzszyda/Projekty/poo-of-shame`.
- Branch: `rewrite`.
- Remote: `origin/rewrite`.
- Latest pushed commit at handoff time: `53cafd7 Lazy-load library actions in aggregate views`.
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
    - `docs/current-state.md` and `docs/next-chat-handoff.md` are updated for the current migration/library state.

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

## Suggested Next Move

Najbardziej naturalny kolejny krok:

- dopracowac UX `gameAccess`,
- uruchomic i zweryfikowac repair `wanted/rating`,
- sprawdzic, czy sa jeszcze legacy dane, ktorych nowy model nie obsluzyl,
- ewentualnie rozbic `src/pages/LibraryPage.tsx` na mniejsze komponenty.

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
