import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'
import react from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default tseslint.config([
    globalIgnores(['dist', 'src/app/api/zpotify/index.ts']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
            react.configs.flat.recommended,
            react.configs.flat['jsx-runtime'],
            importPlugin.flatConfigs.recommended,
            importPlugin.flatConfigs.typescript,
            prettierRecommended,
        ],
        settings: {
            react: { version: 'detect' },
            'import/resolver': { typescript: { alwaysTryTypes: true } },
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        rules: {
            'react/prop-types': 'off',

            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

            'no-console': ['warn', { allow: ['warn', 'error'] }],

            // Use cn() from classnames instead of template literals for className
            'no-restricted-syntax': [
                'warn',
                {
                    selector: 'JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral',
                    message: "Use cn() from 'classnames' instead of template literals for className.",
                },
            ],

            // Named function declarations — no `const fn = () => {}`
            'func-style': ['warn', 'declaration', { allowArrowFunctions: false }],

            // No inline styles — CSS Modules only
            'react/forbid-component-props': ['warn', { forbid: ['style'] }],

            // gRPC clients must only be used inside src/processes/ (type-only imports are allowed anywhere)
            '@typescript-eslint/no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@/app/api/**'],
                            message:
                                'gRPC clients must only be called from src/processes/. Use a process function instead.',
                            allowTypeImports: true,
                        },
                    ],
                },
            ],

            // tsc already catches unresolved imports; disabling avoids false positives with path aliases and CSS modules
            'import/no-unresolved': 'off',

            'import/order': [
                'error',
                {
                    groups: [
                        ['builtin', 'external'],
                        ['internal'],
                        ['parent', 'sibling', 'index'],
                        ['unknown'],
                    ],
                    pathGroups: [
                        {
                            pattern: 'react|react-dom|react-router-dom',
                            group: 'builtin',
                            position: 'before',
                        },
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '*.{css,scss}',
                            patternOptions: { matchBase: true },
                            group: 'index',
                            position: 'after',
                        },
                    ],
                    'newlines-between': 'always',
                },
            ],
        },
    },
    // Allow processes and shared/api to import gRPC clients directly
    {
        files: ['src/processes/**/*.{ts,tsx}', 'src/shared/api/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-restricted-imports': 'off',
        },
    },
])
