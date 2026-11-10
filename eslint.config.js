/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: CC0-1.0
 */

import markdown from '@eslint/markdown'
import { recommendedLibrary } from '@nextcloud/eslint-config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import { defineConfig } from 'eslint/config'

export default defineConfig([
	...recommendedLibrary,
	{
		files: ['**/*.md'],
		plugins: { markdown },
		language: 'markdown/gfm',
		extends: ['markdown/recommended'],
		rules: {
			// GitHub alerts like `> [!WARNING]`
			'markdown/no-missing-label-refs': [
				'error',
				{
					allowLabels: [
						'!NOTE',
						'!TIP',
						'!IMPORTANT',
						'!WARNING',
						'!CAUTION',
					],
				},
			],
		},
	},
	// Formatting is done by Prettier, so turn off conflicting rules. Must be last.
	eslintConfigPrettier,
	{
		rules: {
			// Conflicts with Prettier, but is not yet turned off by eslint-config-prettier
			'@stylistic/exp-list-style': 'off',
		},
	},
])
