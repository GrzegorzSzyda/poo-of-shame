# Dokumentacja API Convex

Ten dokument opisuje aktualne API backendu w katalogu `convex/`.

## Konfiguracja i auth

### Zmienne środowiskowe

- `CLERK_JWT_ISSUER_DOMAIN`  
  Wymagane. Używane w `convex/auth.config.ts`.
- `GAMES_ADMIN_TOKEN_IDENTIFIERS`  
  Opcjonalne. Lista adminów rozdzielona przecinkami.  
  Wspierane formaty wpisów:
    - `user_xxx`
    - `issuer|user_xxx`

### Zasady dostępu

- Brak sesji użytkownika: `UNAUTHORIZED`.
- Operacje na `games` (`create`, `update`, `remove`) wymagają uprawnień admina.
- Jeśli `GAMES_ADMIN_TOKEN_IDENTIFIERS` jest puste, nikt nie ma uprawnień do zarządzania grami.

## Modele danych

### `games`

- `_id`
- `title: string`
- `titleNormalized: string`
- `releaseYear: number`
- `coverImageUrl?: string`

Indeks:

- `by_titleYear` (`titleNormalized`, `releaseYear`)

### `libraryEntries`

- `_id`
- `userId: string`
- `gameId: Id<'games'>`
- `gameTitle?: string`
- `gameReleaseYear?: number`
- `gameCoverImageUrl?: string`
- `platforms: Platform[]`
- `rating: number` (`0..100`, int)
- `wantsToPlay: number` (`0..100`, int)
- `progressStatus: ProgressStatus`
- `createdAt: number`
- `updatedAt: number`

Indeksy:

- `by_user` (`userId`)
- `by_user_game` (`userId`, `gameId`)
- `by_game` (`gameId`)
- `by_user_progress` (`userId`, `progressStatus`)
- `by_user_wantsToPlay` (`userId`, `wantsToPlay`)

### Słowniki

`Platform`:

- `ps_disc`
- `ps_store`
- `ps_plus`
- `steam`
- `epic`
- `gog`
- `amazon_gaming`
- `ubisoft_connect`
- `xbox`
- `switch`
- `other`

`ProgressStatus`:

- `backlog`
- `playing`
- `completed`
- `done`
- `dropped`

## API: `games`

Plik: `convex/games.ts`

### `games.list` (query)

Args:

- `paginationOpts` (Convex pagination opts)

Auth: wymagane logowanie  
Zwraca: wynik paginacji `{ page, isDone, continueCursor, ... }`, gdzie `page` to `Doc<'games'>[]`.

Przykład:

```ts
import { usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const { results: games, status, loadMore } = usePaginatedQuery(
    api.games.list,
    {},
    { initialNumItems: 24 },
)
```

### `games.canManage` (query)

Args: brak  
Auth: wymagane logowanie  
Zwraca: `boolean`

Przykład:

```ts
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const canManageGames = useQuery(api.games.canManage)
```

### `games.create` (mutation)

Args:

- `title: string`
- `releaseYear: number`
- `coverImageUrl?: string`

Auth: admin  
Zwraca: `Id<'games'>`

Błędy:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `TITLE_REQUIRED`
- `RELEASE_YEAR_INVALID`
- `GAME_TITLE_YEAR_ALREADY_EXISTS`

Walidacja:

- `title.trim()` nie może być puste.
- `releaseYear` musi być liczbą całkowitą z zakresu `1957..(currentYear + 1)`.

Przykład:

```ts
import { useMutation, usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const createGame = useMutation(api.games.create)

await createGame({
    title: 'Cyberpunk 2077',
    releaseYear: 2020,
    coverImageUrl: 'https://example.com/cp2077.jpg',
})
```

### `games.update` (mutation)

Args:

- `gameId: Id<'games'>`
- `title: string`
- `releaseYear: number`
- `coverImageUrl?: string`

Auth: admin  
Zwraca: `void`

Błędy:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `GAME_NOT_FOUND`
- `TITLE_REQUIRED`
- `RELEASE_YEAR_INVALID`
- `GAME_TITLE_YEAR_ALREADY_EXISTS`

Skutki uboczne:

- Aktualizuje też snapshot gry (`gameTitle`, `gameReleaseYear`, `gameCoverImageUrl`) we wszystkich powiązanych `libraryEntries`.

Przykład:

```ts
import { useMutation, usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const updateGame = useMutation(api.games.update)
const { results: games } = usePaginatedQuery(api.games.list, {}, { initialNumItems: 1 })
const game = games[0]

if (game) {
    await updateGame({
        gameId: game._id,
        title: 'Cyberpunk 2077: Ultimate Edition',
        releaseYear: 2023,
        coverImageUrl: 'https://example.com/cp2077-ultimate.jpg',
    })
}
```

### `games.remove` (mutation)

Args:

- `gameId: Id<'games'>`

Auth: admin  
Zwraca: `void`

Błędy:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `GAME_NOT_FOUND`

Skutki uboczne:

- Kaskadowo usuwa powiązane wpisy z `libraryEntries` (po indeksie `by_game`).

Przykład:

```ts
import { useMutation, usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const removeGame = useMutation(api.games.remove)
const { results: games } = usePaginatedQuery(api.games.list, {}, { initialNumItems: 1 })
const game = games[0]

if (game) {
    await removeGame({
        gameId: game._id,
    })
}
```

## API: `library`

Plik: `convex/library.ts`

### `library.listMyLibrary` (query)

Args:

- `paginationOpts` (Convex pagination opts)

Auth: wymagane logowanie  
Zwraca: wynik paginacji `{ page, isDone, continueCursor, ... }`.

Każdy element zawiera:

- pola `libraryEntries`
- `game: { title, releaseYear, coverImageUrl? } | null`

Snapshot gry jest czytany najpierw z `libraryEntries`; fallback do `games` dla starszych rekordów.

Błędy:

- `UNAUTHORIZED`

Przykład:

```ts
import { usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const { results: myLibrary, status, loadMore } = usePaginatedQuery(
    api.library.listMyLibrary,
    {},
    { initialNumItems: 50 },
)
```

### `library.listMyLibraryFiltered` (query)

Args:

- `paginationOpts` (Convex pagination opts)
- `progressStatus?: ProgressStatus`
- `wantsToPlayMin?: number` (`0..100`, int)
- `platform?: Platform`

Auth: wymagane logowanie  
Zwraca: jak `listMyLibrary`, z filtrami.

Błędy:

- `UNAUTHORIZED`
- `WANTS_TO_PLAY_MIN_INVALID`

Uwagi wydajnościowe:

- Dla `progressStatus` używa indeksu `by_user_progress`.
- Dla `wantsToPlayMin > 0` używa indeksu `by_user_wantsToPlay` tylko gdy `progressStatus` nie jest podane.
- Pozostałe filtry (np. `platform`) są wykonywane po pobraniu rekordów.

Przykład:

```ts
import { usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const { results: filteredLibrary, status, loadMore } = usePaginatedQuery(
    api.library.listMyLibraryFiltered,
    {
        progressStatus: 'playing',
        wantsToPlayMin: 60,
        platform: 'steam',
    },
    { initialNumItems: 50 },
)
```

### `library.addToLibrary` (mutation)

Args:

- `gameId: Id<'games'>`
- `platforms: Platform[]`
- `rating: number` (`0..100`, int)
- `wantsToPlay: number` (`0..100`, int)
- `progressStatus: ProgressStatus`

Auth: wymagane logowanie  
Zwraca: `Id<'libraryEntries'>`

Błędy:

- `UNAUTHORIZED`
- `GAME_NOT_FOUND`
- `RATING_INVALID`
- `WANTS_TO_PLAY_INVALID`
- `LIB_ENTRY_ALREADY_EXISTS`

Uwagi:

- Zapisuje snapshot gry do pól `gameTitle`, `gameReleaseYear`, `gameCoverImageUrl`.

Przykład:

```ts
import { useMutation, usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const addToLibrary = useMutation(api.library.addToLibrary)
const { results: games } = usePaginatedQuery(api.games.list, {}, { initialNumItems: 1 })
const game = games[0]

if (game) {
    await addToLibrary({
        gameId: game._id,
        platforms: ['steam', 'gog'],
        rating: 85,
        wantsToPlay: 90,
        progressStatus: 'backlog',
    })
}
```

### `library.updateLibraryEntry` (mutation)

Args:

- `entryId: Id<'libraryEntries'>`
- `platforms: Platform[]`
- `rating: number`
- `wantsToPlay: number`
- `progressStatus: ProgressStatus`

Auth: właściciel wpisu  
Zwraca: `void`

Błędy:

- `UNAUTHORIZED`
- `LIB_ENTRY_NOT_FOUND`
- `FORBIDDEN`
- `RATING_INVALID`
- `WANTS_TO_PLAY_INVALID`

Przykład:

```ts
import { useMutation, usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const updateLibraryEntry = useMutation(api.library.updateLibraryEntry)
const { results: myLibrary } = usePaginatedQuery(
    api.library.listMyLibrary,
    {},
    { initialNumItems: 1 },
)
const entry = myLibrary[0]

if (entry) {
    await updateLibraryEntry({
        entryId: entry._id,
        platforms: ['steam'],
        rating: 92,
        wantsToPlay: 30,
        progressStatus: 'completed',
    })
}
```

### `library.removeFromLibrary` (mutation)

Args:

- `entryId: Id<'libraryEntries'>`

Auth: właściciel wpisu  
Zwraca: `void`

Błędy:

- `UNAUTHORIZED`
- `LIB_ENTRY_NOT_FOUND`
- `FORBIDDEN`

Przykład:

```ts
import { useMutation, usePaginatedQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const removeFromLibrary = useMutation(api.library.removeFromLibrary)
const { results: myLibrary } = usePaginatedQuery(
    api.library.listMyLibrary,
    {},
    { initialNumItems: 1 },
)
const entry = myLibrary[0]

if (entry) {
    await removeFromLibrary({
        entryId: entry._id,
    })
}
```

## Uwagi implementacyjne

- Kody błędów są rzucane jako `ConvexError("KOD")` i mapowane w UI na komunikaty.
- Część operacji (`games.update`, `games.remove`) wykonuje dodatkowe operacje na `libraryEntries`.
- Warto utrzymywać zgodność wartości `Platform` i `ProgressStatus` między frontendem i backendem.
