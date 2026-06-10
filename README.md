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
    - `/admin/integrations` - konfiguracja IGDB,
    - `/admin/migration` - migracja starej biblioteki do modelu rewrite.

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

Codzienny lokalny start:

```bash
bun run dev
```

Ta komenda odpala watcher Convexa i lokalny serwer web. Druga codzienna komenda,
przed commitem:

```bash
bun run check
```

Klocki pod spodem, gdy trzeba odpalic cos osobno:

```bash
bun run dev:web        # sam lokalny serwer web
bun run convex:dev     # ciagly proces Convexa
bun run dev:setup      # codegen + jednorazowy sync Convexa
bun run convex:once
```

Jesli port `3001` jest zajety:

```bash
PORT=3002 bun run dev
```

Build produkcyjny:

```bash
bun run build
```

## Weryfikacja Przed Commitem

```bash
bun run check
```
