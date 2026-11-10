/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: CC0-1.0
 */

import { createLibConfig } from '@nextcloud/vite-config'

export default createLibConfig(
	{
		index: 'src/index.ts',
	},
	{
		DTSPluginOptions: {
			exclude: ['src/**/*.test.ts'],
		},
	},
)
