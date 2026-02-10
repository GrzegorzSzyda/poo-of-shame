# Convex Backend

Dokumentacja API (PL): `convex/API.md`

Przydatne komendy:

```bash
npx convex dev
npx convex deploy
npx convex env list
```

Dokumentacja Convex:

- https://docs.convex.dev/functions
- https://docs.convex.dev/auth

## Checklist deploy

- `CLERK_JWT_ISSUER_DOMAIN` ustawione dla danego deploymentu.
- `GAMES_ADMIN_TOKEN_IDENTIFIERS` ustawione i niepuste dla danego deploymentu (`dev`, `prod`).
- Po zmianach auth/schema uruchomione `npx convex dev` lub `npx convex deploy`.
