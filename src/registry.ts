/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditorExtensionRegistryEvents } from './ui/event-editor/registration.ts'

import { getScopedGlobals } from './globalScope.ts'

/**
 * Registry events by event name.
 */
export type ExtensionRegistryEvents = EventEditorExtensionRegistryEvents

/**
 * Event target of the registry events.
 */
export type ExtensionRegistry = EventTarget

/**
 * Subscription of a callback to registry events.
 */
export interface RegistrySubscription {
	/**
	 * Stop calling the callback. Calling it more than once does nothing.
	 */
	unsubscribe(): void
}

/**
 * Get the extension registry shared by all copies of this library on the page.
 *
 * @return The shared extension registry
 */
export function getRegistry(): ExtensionRegistry {
	const scopedGlobals = getScopedGlobals()
	scopedGlobals.extensionRegistry ??= new EventTarget()
	return scopedGlobals.extensionRegistry
}

/**
 * Dispatch a registry event.
 *
 * @param type - The name of the event
 * @param detail - The detail of the event
 */
export function dispatchRegistryEvent<T extends keyof ExtensionRegistryEvents>(
	type: T,
	detail: ExtensionRegistryEvents[T]['detail'],
): void {
	getRegistry().dispatchEvent(new CustomEvent(type, { detail }))
}

/**
 * Register a callback that is called with the detail of each registry event of a type.
 *
 * @param type - The name of the event
 * @param callback - Called with the detail of the event
 * @return The subscription of the callback
 */
export function addRegistryListener<T extends keyof ExtensionRegistryEvents>(
	type: T,
	callback: (detail: ExtensionRegistryEvents[T]['detail']) => void,
): RegistrySubscription {
	const listener = (event: Event) =>
		callback((event as ExtensionRegistryEvents[T]).detail)
	const registry = getRegistry()
	registry.addEventListener(type, listener)
	return {
		unsubscribe: () => registry.removeEventListener(type, listener),
	}
}
