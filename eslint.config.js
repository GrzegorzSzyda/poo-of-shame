import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'
import a11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

export default [
  { ignores: ['dist', '.vite', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({ ...c, files: ['**/*.{ts,tsx}'] })),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: { project: ['./tsconfig.json'] },
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y, import: importPlugin },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
]