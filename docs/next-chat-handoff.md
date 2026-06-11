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
Lazy-load library actions in aggregate views
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
- indeks `userGames.by_game`,
- zakladki widokow na `/library`,
- aktywny widok `Wszystkie`,
- backendowe query `listMyLibraryAll`,
- filtrowanie `Wszystkie` po tytule, statusie i obecnosci runu,
- prosta paginacja stron dla `Wszystkie`,
- aktywny widok `Kupka`,
- backendowe query `listMyBacklog`,
- `Kupka` pokazuje tylko `wanted` i `owned`,
- `Kupka` ma filtrowanie po tytule i statusie oraz sortowanie
  `interest desc`, potem `updatedAt desc`.
- aktywny widok `Gram Teraz`,
- backendowe query `listMyActiveRuns`,
- `Gram Teraz` pokazuje runy z `gameRuns.status = playing`,
- `Gram Teraz` ma wyszukiwanie po tytule i prosta paginacje.
- aktywny widok `Historia`,
- backendowe query `listMyRunHistoryByYear`,
- `Historia` ma wybór roku oraz sekcje: rozpoczęte, ukończone, wymaksowane,
  porzucone i bez konkretnego roku.
- aktywny widok `Premiery`,
- backendowe query `listMyReleaseCalendar` i `listCatalogReleaseCalendar`,
- `Premiery` ma dwa warianty: `Moje premiery` i `Katalog`,
- oba warianty maja filtrowanie po tytule, roku albo `brak roku`.
- akcje `userGame` sa wspolne dla `Wszystkie`, `Kupka`, `Gram Teraz`,
  `Historia` i wpisow z `Premiery`, jesli gra istnieje juz w bibliotece,
- w widokach agregujacych (`Gram Teraz`, `Historia`, `Premiery`) panel akcji
  jest montowany leniwie po kliknieciu `Akcje`, bo bez tego pojawila sie
  regresja wydajnosciowa i problemy z dzialaniem widokow,
- reczny panel `Dostęp` pod wpisem gry w `/library`,
- backendowe query/mutacje:
  `listAccessForUserGame`, `createGameAccess`, `updateGameAccess`,
  `deleteGameAccess`,
- panel pozwala zapisywac platforme, zrodlo, typ dostepu, dostepnosc i notatke.
- backendowe query `getLibraryEntry` pozwala doczytac pojedynczy rekord
  `userGame` pod wspolny panel akcji.
- panel `/admin/migration` ma osobny preview i batch backfillu brakujacych
  `gameAccess` na podstawie `libraryEntries.platforms`,
- backendowe funkcje:
  `getGameAccessBackfillPreview`, `backfillGameAccessBatch`.
- panel `/admin/migration` ma tez osobny preview i batch repairu:
  `backlog bez platform -> wanted` oraz dopiecia legacy `rating` do runow,
- backendowe funkcje:
  `getLegacySemanticBackfillPreview`, `backfillLegacySemanticBatch`.

Push wykonany na `origin/rewrite`.

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
- `src/pages/LibraryPage.tsx` - shell widokow biblioteki i aktywny widok `Wszystkie`.
- `convex/library.ts` - query/mutacje dla `userGames`, w tym `listMyLibraryAll`.
- `convex/migrations.ts` - admin-only migracja `libraryEntries`.
- `docs/current-state.md` - aktualna dokumentacja techniczna.
- `docs/product-v1.md` - kierunek produktu.
- `docs/library-views.md` - plan widokow biblioteki po migracji.
- `docs/fresh-chat-context.md` - gotowy prompt i skrot dla swiezego chatu.

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

Widoki biblioteki po migracji juz dzialaja w podstawowym zakresie. Najlepszy
kolejny krok to dopracowanie UX i filtrow tam, gdzie model danych juz jest, ale
UI jest jeszcze techniczne.

Priorytet implementacji:

- dopracowanie UX i filtrow wokol `gameAccess`,
- uruchomienie repairu `wanted/rating` na realnych danych i weryfikacja wyniku,
- zweryfikowanie na danych, czy zostaly jeszcze jakies legacy edge-case'y
  migracji,
- ewentualne dodatkowe filtry i lepsze sortowanie widokow premier,
- ewentualne porzadki/refaktor `src/pages/LibraryPage.tsx`, bo komponent jest
  juz duzy mimo dzialajacych widokow.

Nie usuwac `libraryEntries`, dopoki migracja nie zostanie zweryfikowana na danych.
