# Poo of Shame

Fresh rewrite baseline.

The previous application has been moved to `legacy/current-app` so it can be
referenced without shaping the new implementation.

## Development

Install dependencies:

```bash
bun install
```

Required local environment:

```bash
CONVEX_DEPLOYMENT=dev:...
CONVEX_URL=https://...
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-instance.clerk.accounts.dev
```

After changing Convex auth config, sync the dev deployment:

```bash
bunx convex dev --once
```

Run the local dev server:

```bash
bun dev
```

Build for production:

```bash
bun run build
```
