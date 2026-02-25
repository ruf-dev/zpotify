import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite,
			"eslint:recommended",
			"plugin:react/recommended",
			"plugin:import/recommended",
			"plugin:import/typescript",
			"plugin:prettier/recommended"
		],
		plugins: ["import"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			"import/order": [
				"error",
				{
					"groups": [
						["builtin", "external"], // Built-in Node and External libraries
						["internal"], // Aliased imports (e.g., @/app)
						["parent", "sibling", "index"], // Relative imports
						["unknown"] // Unrecognized/Unknown groups
					],
					"pathGroups": [
						// Rule for React base packages group
						{
							"pattern": "react|react-dom|react-router-dom",
							"group": "builtin",
							"position": "before"
						},
						// Rule for CSS style imports
						{
							"pattern": "*.css",
							"group": "index",
							"position": "before"
						},
						// Rule for TSX/Components imports (aliased)
						{
							"pattern": "@/**",
							"group": "internal",
							"position": "before"
						}
					]
				}
			]
		}
	},
])
