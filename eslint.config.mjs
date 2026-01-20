import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.

  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '**/*.config.js',
    '**/*.config.cjs',
    '**/*.config.mjs',
    'scripts/**',
    'tests/e2e/**',
    '.prettierrc',
    '.prettierignore',
    'postcss.config.mjs',
    'next.config.ts',
    'components.json',
    'node_modules',
    '.next',
    'out',
    'build',
    'dist',
    'next-env.d.ts',
    '*.d.ts',
    'prisma/migrations',
    '.DS_Store',
    '*.log',
  ]),
])

export default eslintConfig
