import { defineConfig } from 'vitest/config'

const isCI = !!process.env.CI

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.tsx'],
        exclude: ['node_modules', 'dist', '.vite', 'coverage'],
        restoreMocks: true,
        clearMocks: true,
        mockReset: true,
        testTimeout: 5000,
        hookTimeout: 5000,
        ...(isCI
            ? {
                  reporters: ['default', 'junit'] as const,
                  outputFile: { junit: 'reports/junit.xml' },
              }
            : { reporters: 'default' as const }),
        coverage: {
            provider: 'v8',
            reporter: isCI
                ? ['text-summary', 'lcov', 'cobertura']
                : ['text', 'text-summary', 'html'],
            reportsDirectory: 'coverage',
            all: true,
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.{test,spec}.{ts,tsx}',
                'src/**/*.d.ts',
                'src/**/index.ts',
            ],
            thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
        },
        chaiConfig: { truncateThreshold: 0 },
    },
})
