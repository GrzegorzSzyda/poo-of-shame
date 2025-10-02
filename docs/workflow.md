# Development Workflow

## Dev

```bash
bun run dev
```

## Build & Preview

```bash
bun run build
bun run preview
```

## Code Quality

Quick fixes:

```bash
bun run fix
```

Full verification:

```bash
bun run check
```

The `check` command runs: Prettier (check) → ESLint → TypeScript (app + tests) → Vitest.

## Tests

```bash
bun run test
```

## Commit & Push

- **pre-commit**: `lint-staged` (Prettier + ESLint `--fix` on staged files)
- **pre-push**: full `bun run check`
