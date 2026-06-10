# Handoff Dla Kolejnych Chatow

Ten dokument jest skrotem kontekstu dla kolejnych sesji z asystentem.

## Jak Pracujemy

- Uzytkownik chce pracowac malymi krokami, ale z porzadnym modelem danych.
- Przed wiekszymi decyzjami warto go "maglowac" pytaniami.
- Po ustaleniu decyzji nalezy implementowac, testowac, commitowac i pushowac.
- Aktualny branch roboczy to `rewrite`.
- Nie tworzyc kolejnych branchy bez wyraznej potrzeby.
- Nie wrzucac rewrite na `main`, dopoki podstawowe funkcje nie beda gotowe.
- Taski i komentarze na GitHubie pisac po polsku.

## Repo

- Lokalizacja: `/home/grzegorzszyda/Projekty/poo-of-shame`
- GitHub: `GrzegorzSzyda/poo-of-shame`
- Branch: `rewrite`
- Stara aplikacja: `legacy/current-app`

## Stan Na Koniec Ostatniej Sesji

Ostatnia zmiana w tej sesji:

```text
Start soft status-to-run flow
```

Zawiera:

- podstawowy widok `/library`,
- wyszukiwanie katalogu przy dodawaniu gry do kupki,
- tworzenie rekordow `userGames`,
- blokade duplikatow `userId + gameId`,
- poczatkowy status i `interest`,
- `interest` tylko dla `wanted`, `owned` i `playing`; statusy zakonczone lub
  porzucone zapisuja `interest: 0`,
- inline edycje statusu i `interest` na liscie `/library`,
- usuwanie wpisow z kupki z blokada, jesli istnieja powiazane `gameRuns` albo
  `gameAccess`,
- inline panel runow pod wpisem `/library`,
- tworzenie runu z datami `unknown`, `exact`, `year`, `quarter`, `month` i
  `text`,
- `createGameRun` aktualizuje `lastRunId`, a pierwszy run ustawia `pinnedRunId`,
- edycje i usuwanie runow inline,
- opcjonalny rating i notatke per run,
- backendowa walidacje ratingu `0..100`,
- czyszczenie dat runu przy zmianie precyzji na `unknown`,
- przestawianie albo czyszczenie `lastRunId`/`pinnedRunId` po usunieciu runu,
- miekka sugestie po zmianie statusu gry na `playing`, `completed`, `mastered`
  albo `dropped`; status gry nie zmienia runow automatycznie,
- szybkie akcje w sugestii: oznaczenie ostatniego runu odpowiednim statusem albo
  utworzenie nowego runu z tym statusem,
- pelniejsze precyzje dat runow w formularzu tworzenia i edycji,
- panel `/admin/migration` z podgladem i partiowa migracja `libraryEntries` do
  `userGames`, `gameRuns` i `gameAccess`,
- adminowy widok katalogu gier w `/admin/games`,
- dodawanie gry do katalogu,
- podpowiedzi IGDB w formularzu dodawania gry, bez zapisywania `igdbId`,
- liste ostatnich 50 gier,
- edycje gry inline,
- usuwanie gry z backendowa blokada, jesli gra jest juz uzywana,
- wspolny formularz gry,
- indeks `userGames.by_game`.

Push wykonany na `origin/rewrite`.

Issue #8 dostalo komentarz z zakresem wykonanej pracy.

## Wazne Decyzje Produktowe

- Zostajemy przy Convexie, bo w istniejacej bazie jest juz ponad 1000 gier.
- Zostajemy przy Clerku.
- Wszystko na razie moze byc za loginem.
- Gry do glownego katalogu dodaje admin.
- Uzytkownik dodaje gry z katalogu do swojej biblioteki/kupki.
- `games` nie powinno opierac sie domenowo o `igdbId`.
- Unikalnosc gry: znormalizowany tytul + data/premiera przez `releaseKey`.
- `releaseStatus` nie jest trzymany, ma wynikac z daty/premiery w widokach.
- Okładki uploadujemy do Convex storage.
- `priority` zostalo odrzucone.
- Ocena jest per run.
- Wyswietlany run: `pinnedRunId`, a jesli go nie ma, `lastRunId`.
- Zmiana statusu gry nie powinna ukrycie modyfikowac historii runow; UI ma
  sugerowac jawna akcje na runie.
- Nie robimy teraz sledzenia czasu gry.

## Wazne Decyzje Techniczne

- Baza Convexa jest ta sama co w starej aplikacji.
- Zmiany schematu powinny byc addytywne.
- Nie usuwac `libraryEntries` bez migracji.
- Backend ma uzywac indeksow pod konkretne widoki, zamiast pobierac dane i
  filtrowac/sortowac wszystko w pamieci.
- Uprawnienia admina musza byc sprawdzane w backendzie, nie tylko w UI.

## Aktualne Pliki Do Znania

- `convex/schema.ts` - obecny schemat.
- `convex/admin.ts` - role, IGDB, admin status.
- `convex/games.ts` - katalog gier i upload okładek.
- `src/pages/AdminPage.tsx` - routing panelu admina.
- `src/features/admin/GamesAdminPanel.tsx` - lista/edycja/usuwanie gier.
- `src/features/admin/AddGameForm.tsx` - dodawanie gry.
- `src/features/admin/GameFormFields.tsx` - wspolne pola formularza gry.
- `src/features/admin/releaseForm.ts` - mapping formularza premiery.
- `src/features/admin/UserRolesPanel.tsx` - role.
- `src/features/admin/IgdbSettingsForm.tsx` - IGDB.
- `src/features/admin/LibraryMigrationPanel.tsx` - migracja legacy biblioteki.
- `src/pages/LibraryPage.tsx` - podstawowa kupka uzytkownika.
- `convex/library.ts` - query/mutacje dla `userGames`.
- `convex/migrations.ts` - admin-only migracja `libraryEntries`.
- `docs/current-state.md` - aktualna dokumentacja techniczna.
- `docs/product-v1.md` - kierunek produktu.

## Komendy Weryfikacyjne

Po zmianach:

```bash
bun run check
```

Dev server:

```bash
bun run dev
```

Pomocnicze komendy dev:

```bash
bun run dev:web
bun run convex:dev
bun run dev:setup
bun run convex:once
```

Jesli port `3001` jest zajety:

```bash
PORT=3002 bun run dev
```

## Najbardziej Naturalny Nastepny Task

Najlepszy kolejny krok to uruchomic migracje z `/admin/migration` partiami,
sprawdzic wyniki w `/library`, a potem domknac wybor glownego runu:

- lepszy wybor, ktory run jest `pinnedRunId`.

Nie usuwac `libraryEntries`, dopoki migracja nie zostanie zweryfikowana na danych.
