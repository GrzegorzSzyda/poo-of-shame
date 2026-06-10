# Widoki Biblioteki Po Migracji

Cel: zastapic jeden duzy arkusz/listę zestawem widokow roboczych. Widoki maja
odpowiadac sposobowi pracy ze starego Excela, ale korzystac z nowego modelu:
`userGames`, `gameRuns`, `gameAccess` i `games`.

## Zasady

- Nie filtrowac duzej listy tylko po stronie klienta.
- Dodawac query Convexa pod konkretne widoki.
- Historia grania ma wynikac z `gameRuns`, nie z samego `userGames.status`.
- `userGames.status` zostaje ogolnym stanem gry na kupce.
- `playing` nie nalezy do glownej kupki/backlogu.
- `libraryEntries` zostaja jako legacy do czasu weryfikacji migracji.

## Widok: Kupka

Odpowiednik arkusza "Kupka wstydu".

Pokazuje gry, w ktore uzytkownik jeszcze nie gra aktywnie i ktorych nie zakonczyl:

- `userGames.status = wanted`
- `userGames.status = owned`

Nie pokazuje:

- `playing`
- `completed`
- `mastered`
- `dropped`

Minimalne sortowanie:

- `wanted` i `owned` razem albo z filtrem statusu,
- `interest desc`,
- potem `updatedAt desc`.

Minimalne filtry:

- wyszukiwanie po tytule,
- status: `wanted` / `owned` / oba,
- docelowo platforma/access.

## Widok: Gram Teraz

Widok aktywnych runow, nie aktywnych statusow gry.

Pokazuje:

- `gameRuns.status = playing`,
- tytul gry,
- status gry z `userGames`,
- date startu runu, jezeli jest,
- typ runu,
- rating/notatke, jezeli sa.

Powod: gra moze byc ogolnie `completed`, ale miec nowy aktywny replay albo DLC.

## Widok: Historia

Odpowiednik arkuszy rocznych.

Zrodlo danych:

- `gameRuns`, nie `userGames`.

Filtry:

- rok,
- miesiac opcjonalnie pozniej,
- status runu.

Sekcje w danym roku:

- `Grane / rozpoczęte`: runy ze `startedYear` albo `startedYearMonth`,
- `Ukończone`: runy `completed` z `finishedYear` albo `finishedYearMonth`,
- `Wymaksowane`: runy `mastered` z `finishedYear` albo `finishedYearMonth`,
- `Porzucone`: runy `dropped` z `finishedYear` albo `finishedYearMonth`.

Daty tekstowe i nieznane nie powinny znikać bez sladu. W V1 moga trafic do
sekcji "Bez konkretnego roku" albo byc widoczne po filtrze statusu.

## Widok: Premiery

Potrzebne sa dwa warianty.

### Moje Premiery

Pokazuje tylko gry z `userGames`, sortowane po danych premiery z `games`.

Przydatne do:

- nadchodzacych premier z kupki,
- sprawdzania backlogu po roczniku,
- wykrywania gier z nieznana data premiery.

### Premiery Z Katalogu

Pokazuje `games` niezaleznie od tego, czy sa w kupce.

Przydatne do:

- przegladania katalogu,
- znajdowania rzeczy do dodania,
- kontroli jakosci danych katalogowych.

## Widok: Wszystkie

Techniczny widok kontrolny po migracji.

Pokazuje wszystkie `userGames`.

Minimalne filtry:

- tekst po tytule,
- status gry,
- ma run / nie ma runu,
- status ostatniego/pinned runu,
- rok startu runu,
- rok zakonczenia runu.

Ten widok nie musi byc docelowym dashboardem. Ma sluzyc do sanity-checku danych,
sprzatania migracji i szybkiego szukania wpisow.

## Kolejnosc Implementacji

1. `Wszystkie` + podstawowe filtrowanie i limit/stronicowanie.
2. `Kupka` jako codzienny widok backlogu bez `playing`.
3. `Gram Teraz` oparty o aktywne runy.
4. `Historia` z wyborem roku.
5. `Premiery`: najpierw `Moje Premiery`, potem `Premiery Z Katalogu`.

## Minimalne Query Convexa

- `listMyLibraryAll`
- `listMyBacklog`
- `listMyActiveRuns`
- `listMyRunHistoryByYear`
- `listMyReleaseCalendar`
- `listCatalogReleaseCalendar`

Nazwy moga sie zmienic przy implementacji, ale query powinny odpowiadac widokom,
a nie byc jednym generycznym pobraniem wszystkiego.
