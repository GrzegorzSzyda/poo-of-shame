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

Ostatni commit:

```text
b8fec6a Add admin game catalog management
```

Zawiera:

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
- `docs/current-state.md` - aktualna dokumentacja techniczna.
- `docs/product-v1.md` - kierunek produktu.

## Komendy Weryfikacyjne

Po zmianach:

```bash
bunx convex codegen
bunx convex dev --once
bun run lint
bun run build
```

Dev server:

```bash
bun dev
```

Jesli port `3001` jest zajety:

```bash
PORT=3002 bun dev
```

## Najbardziej Naturalny Nastepny Task

Najlepszy kolejny krok to dodawanie gry do biblioteki uzytkownika:

- wyszukiwanie katalogu gier,
- wybor gry,
- utworzenie `userGames`,
- podstawowy status i `interest`,
- zabezpieczenie przed duplikatem `userId + gameId`,
- prosty widok "moja biblioteka" jako potwierdzenie, ze dane dzialaja.

Przed implementacja warto doprecyzowac:

- czy pierwszy widok biblioteki ma byc osobna trasa `/library`,
- jakie statusy pokazac w formularzu V1,
- czy dodanie do biblioteki ma od razu tworzyc pierwszy run,
- czy `gameAccess` ma byc wymagane przy dodaniu gry, czy opcjonalne w kolejnym
  kroku.
