# Poo of Shame

Rewrite aplikacji do katalogowania gier, prywatnej biblioteki i sledzenia
przejsc/runow.

Poprzednia aplikacja jest zachowana w `legacy/current-app`. Traktujemy ja jako
referencje, ale nowa implementacja powstaje od zera na branchu `rewrite`.

## Aktualny Stan

- Frontend: React 19, Bun, Tailwind CSS.
- Backend: Convex.
- Auth: Clerk + Convex auth config.
- Glowny branch roboczy: `rewrite`.
- Baza Convexa jest ta sama co w starej aplikacji, wiec nie robimy
  destrukcyjnych resetow danych.
- Dostep do aplikacji jest za logowaniem.
- Panel admina ma osobne widoki:
    - `/admin/games` - dodawanie, podglad, edycja i usuwanie gier z katalogu,
    - `/admin/users` - nadawanie rol,
    - `/admin/integrations` - konfiguracja IGDB.

## Dokumentacja

- `docs/product-v1.md` - kierunek produktu i decyzje domenowe.
- `docs/current-state.md` - aktualna architektura i zaimplementowane funkcje.
- `docs/next-chat-handoff.md` - skrot dla kolejnych sesji z asystentem.

## Development

Instalacja zaleznosci:

```bash
bun install
```

Wymagane zmienne lokalne:

```bash
CONVEX_DEPLOYMENT=dev:...
CONVEX_URL=https://...
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-instance.clerk.accounts.dev
GAMES_ADMIN_TOKEN_IDENTIFIERS=...
```

Po zmianach w `convex/auth.config.ts` albo funkcjach Convexa:

```bash
bunx convex dev --once
```

Lokalny serwer:

```bash
bun dev
```

Jesli port `3001` jest zajety:

```bash
PORT=3002 bun dev
```

Build produkcyjny:

```bash
bun run build
```

## Weryfikacja Przed Commitem

```bash
bunx convex codegen
bunx convex dev --once
bun run lint
bun run build
```
