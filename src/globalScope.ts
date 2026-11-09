/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ExtensionRegistry } from './registry.ts'
import type { IEventEditorExtension } from './ui/event-editor/extension.ts'
import type { EventEditorExtensionKey } from './ui/event-editor/registration.ts'

declare global {
	// eslint-disable-next-line camelcase -- name of the global shared by all copies of the library
	var _nc_calendar_scope: Record<string, Record<string, unknown>> | undefined
}

interface GlobalScope {
	extensionRegistry?: ExtensionRegistry
	eventEditorExtension?: Map<EventEditorExtensionKey, IEventEditorExtension>
}

/**
 * Get the global variables of the calendar library, shared by all copies of it on the page.
 *
 * @return The global variables
 */
export function getScopedGlobals(): GlobalScope {
	globalThis._nc_calendar_scope ??= {}
	globalThis._nc_calendar_scope.v0_0 ??= {}
	return globalThis._nc_calendar_scope.v0_0 as GlobalScope
}
