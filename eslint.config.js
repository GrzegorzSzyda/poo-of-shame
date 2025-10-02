import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import a11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
    { ignores: ['dist', '.vite', 'coverage'] },
    { linterOptions: { reportUnusedDisableDirectives: true } },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked.map((c) => ({
        ...c,
        files: ['**/*.{ts,tsx}'],
    })),
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            parserOptions: { project: ['./tsconfig.json'] },
            globals: { ...globals.browser, ...globals.node },
        },
        plugins: {
            react,
            'react-hooks': hooks,
            'jsx-a11y': a11y,
            'import': importPlugin,
        },
        settings: {
            'react': { version: 'detect' },
            'import/resolver': {
                node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'import/no-unresolved': ['error', { ignore: ['^~/', '\\.(css|svg)$'] }],
            'import/no-cycle': ['error', { maxDepth: 1 }],
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: [
                        '**/*.{test,spec}.{ts,tsx,js,jsx}',
                        'vitest.config.ts',
                        'vite.config.ts',
                        'tailwind.config.ts',
                        'scripts/**/*',
                    ],
                },
            ],
            'indent': 'off',
            'quotes': 'off',
            'semi': 'off',
            'comma-dangle': 'off',
            'object-curly-spacing': 'off',
        },
    },
    {
        files: ['**/*.{test,spec}.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        files: [
            'eslint.config.js',
            'vitest.config.ts',
            'vite.config.ts',
            'tailwind.config.ts',
        ],
        rules: {
            'import/no-unresolved': 'off',
            'import/no-extraneous-dependencies': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
        },
    },
]
