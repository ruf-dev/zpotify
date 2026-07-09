import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'
import react from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

const localPlugin = {
    rules: {
        'no-relative-imports': {
            meta: { type: 'suggestion' },
            create(context) {
                return {
                    ImportDeclaration(node) {
                        const src = node.source.value;
                        if (src.startsWith('./') || src.startsWith('../')) {
                            context.report({
                                node,
                                message: "Use '@/' path alias instead of relative imports.",
                            });
                        }
                    },
                };
            },
        },
    },
};

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
        plugins: { local: localPlugin },
        rules: {
            'react/prop-types': 'off',

            // Deps arrays are managed manually — too many false positives around stable refs/singletons
            'react-hooks/exhaustive-deps': 'off',

            // One React component per file
            'react/no-multi-comp': ['warn', { ignoreStateless: false }],

            // Catch circular imports regardless of FSD layer
            'import/no-cycle': 'error',

            // Empty catch blocks are a deliberate no-op (see promise-chain style below); other empty blocks are bugs
            'no-empty': ['error', { allowEmptyCatch: true }],

            // Split into smaller components instead of nesting DOM 4+ levels deep.
            // 'warn' (not 'error') — 17 pre-existing violations in PlayerBarSegment/CommentsSection
            // are a known baseline as of this rule's introduction; fix the ones you touch.
            'react/jsx-max-depth': ['warn', { max: 3 }],

            // All imports must use the '@/' alias — no relative paths
            'local/no-relative-imports': 'error',

            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

            'no-console': ['warn', { allow: ['warn', 'error'] }],

            // Use cn() from classnames instead of template literals for className
            'no-restricted-syntax': [
                'warn',
                {
                    selector: 'JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral',
                    message: "Use cn() from 'classnames' instead of template literals for className.",
                },
                {
                    selector: 'JSXOpeningElement[name.name="button"]',
                    message: "Use `Button` from '@vervstack/chures' instead of a raw <button> element.",
                },
                {
                    selector:
                        'JSXOpeningElement[name.name="input"]:not(:has(JSXAttribute[name.name="type"] Literal[value="file"]))',
                    message: "Use `Input` from '@vervstack/chures' instead of a raw <input> element.",
                },
                {
                    selector: 'ObjectPattern[properties.length>6]',
                    message:
                        'Destructuring more than 6 properties — keep the whole object as one variable (e.g. `const context = useX(...)`) instead of exploding it into separate bindings/props.',
                },
                {
                    selector: 'JSXOpeningElement[name.name="div"]:not(:has(JSXAttribute[name.name="className"]))',
                    message: '<div> must have a className (use a CSS module class).',
                },
                {
                    selector: 'Property[key.name="zIndex"]',
                    message:
                        'Never use z-index — rely on DOM order or a portal to document.body instead (see pkg/client/ZpotifyUI/CLAUDE.md).',
                },
                {
                    selector: 'CallExpression[callee.object.name="window"][callee.property.name=/^(alert|confirm)$/]',
                    message:
                        "Never use window.alert/window.confirm — use useToaster().catch(err) (@/shared/lib/toaster/ToasterZ.ts) for errors, or chures ConfirmDialog/InfoDialog for confirmations.",
                },
            ],

            // Named function declarations — no `const fn = () => {}`
            'func-style': ['warn', 'declaration', { allowArrowFunctions: false }],

            // No inline styles — CSS Modules only
            'react/forbid-component-props': ['warn', { forbid: ['style'] }],

            // Keep files and functions small — split business logic into a co-located hook/lib file instead of growing one file
            'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
            'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true, IIFEs: true }],

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

            // Enforce the Feature Slice Design layer order from CLAUDE.md:
            // pages/dialogs -> widgets -> features -> entities -> components (shared/app importable from anywhere)
            'import/no-restricted-paths': [
                'error',
                {
                    basePath: './src',
                    zones: [
                        {
                            target: './components',
                            from: ['./widgets', './features', './entities', './pages', './dialogs'],
                            message: 'src/components/** is the lowest FSD layer — it may not import from widgets/features/entities/pages/dialogs.',
                        },
                        {
                            target: './entities',
                            from: ['./widgets', './features', './pages', './dialogs'],
                            message: 'src/entities/** may not import from widgets/features/pages/dialogs.',
                        },
                        {
                            target: './features',
                            from: ['./widgets', './pages', './dialogs'],
                            message: 'src/features/** may not import from widgets/pages/dialogs.',
                        },
                        {
                            target: './widgets',
                            from: ['./pages', './dialogs'],
                            message: 'src/widgets/** may not import from pages/dialogs.',
                        },
                        {
                            target: './dialogs',
                            from: ['./pages'],
                            message: 'Dialogs must not import from pages — pages open dialogs via useDialog(), never the other way around.',
                        },
                    ],
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
