# Aktualny Stan Projektu

Ostatnia aktualizacja: 2026-06-10.

## Cel Rewrite

Poo of Shame ma byc prywatnym narzedziem do:

- utrzymywania wspolnego katalogu gier,
- dodawania gier do wlasnej biblioteki/kupki,
- sledzenia wielu runow jednej gry,
- sprawdzania, co bylo grane w danym roku lub miesiacu,
- budowania statystyk i wykresow w pozniejszych etapach.

V1 nie jest aplikacja spolecznosciowa.

## Stack

- Runtime i dev server: Bun.
- Frontend: React 19.
- Style: Tailwind CSS.
- Backend i baza: Convex.
- Auth: Clerk.
- Branch roboczy rewrite: `rewrite`.

Stara aplikacja jest przeniesiona do `legacy/current-app`. Mozna z niej brac
referencje UX lub logiki, ale nie przenosimy calej struktury bez selekcji.

## Dane I Convex

Rewrite uzywa tej samej bazy Convexa co stara aplikacja. W bazie sa juz
istniejace rekordy gier, dlatego zmiany schematu powinny byc addytywne.

Zachowane tabele legacy:

- `games`
- `libraryEntries`

Nowe tabele rewrite:

- `userGames`
- `gameAccess`
- `gameRuns`
- `appUsers`
- `integrationSettings`

`libraryEntries` zostaje do czasu zaplanowanej i zweryfikowanej migracji.
Migracja jest przygotowana addytywnie i oznacza stare wpisy jako zmigrowane,
ale ich nie usuwa.

Po migracji pojedyncza lista `/library` nie wystarcza do pracy na danych.
Kierunek nowych widokow jest opisany w `docs/library-views.md`.

## Model Domenowy

### `games`

Administrowany katalog gier. Nie trzymamy `igdbId` jako kluczowego pola domeny,
bo chcemy miec wlasna tozsamosc gry i mozliwosc odciecia sie od IGDB.

Unikalnosc katalogu opiera sie o:

- znormalizowany tytul,
- `releaseKey`, wynikajacy z precyzji daty premiery.

Premiera obsluguje rozne poziomy precyzji:

- `exact`
- `year`
- `quarter`
- `month`
- `text`
- `unknown`

Okładki sa zapisywane jako URL do Convex storage po pobraniu z podanego URL-a.

### `userGames`

Relacja uzytkownika z gra. To bardziej "kupka" niz klasyczna biblioteka:
gra moze byc chciana, posiadana, aktualnie grana, ukonczona, wymaksowana albo
porzucona.

Statusy:

- `wanted`
- `owned`
- `playing`
- `completed`
- `mastered`
- `dropped`

Nie ma pola `priority`. Na razie wystarcza `interest`.

### `gameRuns`

Jeden run/przejscie gry. Jedna gra uzytkownika moze miec wiele runow.

Statusy runu:

- `planned`
- `playing`
- `completed`
- `mastered`
- `dropped`

Run ma osobne daty startu i zakonczenia, z taka sama elastyczna precyzja jak
premiera gry. Ocena jest per run. W widokach docelowo wyswietlany jest
`pinnedRunId`, a jezeli go nie ma, `lastRunId`.

### `gameAccess`

Opisuje jak uzytkownik ma dostep do gry. Jest osobne od `userGames`, bo
posiadanie gry nie jest binarne: Steam, PS+, Game Pass, plyta, wishlist i
wygasla subskrypcja to rozne przypadki.

## Auth I Role

Clerk zostaje jako provider logowania.

Convex korzysta z `convex/auth.config.ts` i `CLERK_JWT_ISSUER_DOMAIN`.

Role sa trzymane w `appUsers`:

- `user`
- `admin`

Admin bootstrap odbywa sie przez `GAMES_ADMIN_TOKEN_IDENTIFIERS`. Po zalogowaniu
aktualny uzytkownik jest synchronizowany do Convexa.

## Routing

Aktualne glowne route'y:

- `/` - strona startowa/diagnostyczna po zalogowaniu,
- `/library` - podstawowa biblioteka/kupka uzytkownika,
- `/admin/games` - zarzadzanie katalogiem gier,
- `/admin/users` - zarzadzanie rolami,
- `/admin/integrations` - konfiguracja integracji.
- `/admin/migration` - migracja `libraryEntries` do nowego modelu.

Panel admina jest chroniony zarowno na froncie, jak i w kazdej mutacji/query
backendowej.

## Zaimplementowane Funkcje

### Admin: katalog gier

Pliki:

- `src/features/admin/GamesAdminPanel.tsx`
- `src/features/admin/AddGameForm.tsx`
- `src/features/admin/GameFormFields.tsx`
- `src/features/admin/releaseForm.ts`
- `convex/games.ts`

Backend:

- `createGame`
- `listAdminGames`
- `updateGame`
- `deleteGame`
- `uploadCoverFromUrl`
- `searchIgdbGames`

Zasady:

- tylko admin moze dodawac, edytowac i usuwac gry,
- duplikaty sa blokowane przez `titleNormalized + releaseKey`,
- usuwanie jest blokowane, jesli gra jest uzywana w `libraryEntries` albo
  `userGames`,
- `userGames` ma indeks `by_game` na potrzeby sprawdzania uzycia gry.
- formularz dodawania gry ma podpowiedzi z IGDB, ktore uzupelniaja tytul, date
  premiery i URL okladki; `igdbId` nie jest zapisywane w domenowym rekordzie gry.

### Admin: role

Pliki:

- `src/features/admin/UserRolesPanel.tsx`
- `convex/admin.ts`

Admin moze nadawac role uzytkownikom, ktorzy pojawili sie w `appUsers`.

### Admin: IGDB

Pliki:

- `src/features/admin/IgdbSettingsForm.tsx`
- `convex/admin.ts`

Panel pozwala zapisac `igdbClientId` i `igdbClientSecret` w Convexie.

### Admin: migracja biblioteki

Pliki:

- `src/features/admin/LibraryMigrationPanel.tsx`
- `convex/migrations.ts`

Panel pokazuje podglad migracji `libraryEntries` i pozwala uruchomic migracje
partiami. Migracja:

- tworzy brakujace `userGames`,
- tworzy `gameRuns` dla starych statusow `playing`, `completed`, `done` i
  `dropped`,
- przenosi ocene na run tylko dla statusow `completed`, `done` i `dropped`,
- mapuje stare platformy na `gameAccess`,
- oznacza stare wpisy polami `migratedToUserGameId` i `migratedAt`,
- nie usuwa `libraryEntries`.

Panel ma tez osobny backfill brakujacych `gameAccess` dla wpisow juz
zmigrowanych, oparty o stare `libraryEntries.platforms`.

Panel ma tez osobny repair semantyki legacy:

- `backlog` bez platform jest poprawiany do `wanted`,
- brakujacy legacy `rating` jest dopinany do istniejącego runu albo do nowo
  utworzonego runu.

### Biblioteka uzytkownika

Pliki:

- `src/pages/LibraryPage.tsx`
- `convex/library.ts`

Backend:

- `searchCatalogForLibrary`
- `listMyLibrary`
- `listMyLibraryAll`
- `addGameToLibrary`
- `updateLibraryGame`
- `removeGameFromLibrary`
- `listRunsForUserGame`
- `createGameRun`
- `applyRunSuggestion`
- `updateGameRun`
- `deleteGameRun`

Zasady:

- uzytkownik wyszukuje gry z katalogu po tytule,
- dodanie tworzy rekord `userGames`,
- duplikaty `userId + gameId` sa blokowane,
- poczatkowy status jest wybierany w formularzu,
- `interest` jest ustawiane suwakiem 0-100 tylko dla statusow `wanted`,
  `owned` i `playing`; dla `completed`, `mastered` i `dropped` zapisuje sie 0,
- istniejace wpisy `userGames` mozna edytowac inline na liscie,
- wpisy `userGames` mozna usuwac z potwierdzeniem, dopoki nie maja `gameRuns`
  albo `gameAccess`,
- runy sa pokazywane inline pod wpisem biblioteki,
- dodanie runu aktualizuje `lastRunId`, a pierwszy run ustawia tez
  `pinnedRunId`,
- formularz runu obsluguje status, opcjonalny typ, opcjonalny label, opcjonalna
  ocene, opcjonalna notatke oraz daty startu/konca z precyzjami `unknown`,
  `exact`, `year`, `quarter`, `month` i `text`,
- istniejace runy mozna edytowac inline,
- istniejace runy mozna usuwac z potwierdzeniem; jesli usuwany run byl
  `lastRunId` albo `pinnedRunId`, backend przestawia wskazanie na najnowszy
  pozostaly run albo czysci wskazanie,
- zmiana statusu gry nie aktualizuje runow automatycznie; UI pokazuje miekka
  sugestie przejscia do runow dla statusow `playing`, `completed`, `mastered` i
  `dropped`,
- sugestia pozwala jawnie oznaczyc ostatni run odpowiednim statusem albo
  utworzyc nowy run z tym statusem,
- reczne dodawanie w tym slice nie tworzy jeszcze `gameAccess`, ale migracja
  legacy potrafi utworzyc `gameAccess` na podstawie starych platform,
- `/library` ma tez reczny panel `Dostęp` pod wpisem gry:
  dodawanie, edycje i usuwanie rekordow `gameAccess`,
- `/library` ma juz shell zakladek pod docelowe widoki po migracji,
- aktywny jest widok `Wszystkie` z backendowym filtrowaniem po tytule, statusie
  i obecnosci runu oraz z prosta paginacja stron,
- aktywny jest tez widok `Kupka` na osobnym query, tylko dla statusow `wanted`
  i `owned`, z filtrowaniem po tytule i statusie oraz sortowaniem
  `interest desc`, potem `updatedAt desc`,
- aktywny jest tez widok `Gram Teraz` na osobnym query po
  `gameRuns.status = playing`, z wyszukiwaniem po tytule i prosta paginacja,
- aktywny jest tez widok `Historia` z wyborem roku i sekcjami opartymi o
  `gameRuns`: rozpoczęte, ukończone, wymaksowane, porzucone oraz bez
  konkretnego roku,
- aktywny jest tez widok `Premiery` z dwoma wariantami:
  `Moje premiery` i `Katalog`,
- oba warianty maja filtrowanie po tytule, roku premiery albo `brak roku` oraz
  prosta paginacje.

## Lokalna Praca

Standardowa weryfikacja:

```bash
bun run check
```

Serwer dev:

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

Jesli `3001` jest zajety:

```bash
PORT=3002 bun run dev
```

## Najblizsze Sensowne Kroki

1. Zbudowac widoki biblioteki po migracji zgodnie z `docs/library-views.md`.
2. Zaczac od widoku `Wszystkie` z filtrowaniem, limitem i/lub stronicowaniem.
3. Dodac widok `Kupka` bez statusu `playing`.
4. Dodac wybor glownego runu, czyli kontrolowane ustawianie `pinnedRunId`.
5. Dodac wyszukiwanie/filtrowanie katalogu w adminie, bo lista ostatnich 50 gier
   szybko przestanie wystarczac.
