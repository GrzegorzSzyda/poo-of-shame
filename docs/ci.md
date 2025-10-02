# CI/CD

## GitHub Actions

1. `bun install --frozen-lockfile`
2. `bun run check`
3. Publish unit test results: `reports/junit.xml`
4. Upload HTML coverage: `coverage/`
5. Build and upload `dist/` as artifact

## GitLab CI

Pipeline: `install` → `check` → `build`

- Reports: JUnit (`reports/junit.xml`) and Cobertura (`coverage/cobertura-coverage.xml`)
- Artifacts: `coverage/`, `dist/`
