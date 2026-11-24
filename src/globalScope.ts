/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IntegrationRegistry } from './registry.ts'
import type { EventEditorExtension } from './ui/event-editor/extension.ts'
import type { ExtensionKey as EventEditorExtensionKey } from './ui/event-editor/registration.ts'

declare global {
	// eslint-disable-next-line camelcase -- name of the global shared by all copies of the library
	var _nc_calendar_integration_scope:
		Record<string, Record<string, unknown>> | undefined
}

interface GlobalScope {
	integrationRegistry?: IntegrationRegistry
	eventEditorExtension?: Map<EventEditorExtensionKey, EventEditorExtension>
}

/**
 * Get the global variables of the calendar integration library, shared by all copies of it on the page.
 *
 * @return The global variables
 */
export function getScopedGlobals(): GlobalScope {
	globalThis._nc_calendar_integration_scope ??= {}
	globalThis._nc_calendar_integration_scope.v0_0 ??= {}
	return globalThis._nc_calendar_integration_scope.v0_0 as GlobalScope
}
