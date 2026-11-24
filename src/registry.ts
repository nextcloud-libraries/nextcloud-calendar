/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IntegrationRegistryEvents as EventEditorRegistryEvents } from './ui/event-editor/registration.ts'

import { getScopedGlobals } from './globalScope.ts'

/**
 * Integration registry events by event name.
 */
export type IntegrationRegistryEvents = EventEditorRegistryEvents

/**
 * Event target of the registry events.
 */
export type IntegrationRegistry = EventTarget

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
 * Get the integration registry shared by all copies of this library on the page.
 *
 * @return The shared integration registry
 */
function getRegistry(): IntegrationRegistry {
	const scopedGlobals = getScopedGlobals()
	scopedGlobals.integrationRegistry ??= new EventTarget()
	return scopedGlobals.integrationRegistry
}

/**
 * Dispatch a registry event.
 *
 * @param type - The name of the event
 * @param detail - The detail of the event
 */
export function dispatchRegistryEvent<T extends keyof IntegrationRegistryEvents>(
	type: T,
	detail: IntegrationRegistryEvents[T]['detail'],
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
export function addRegistryListener<T extends keyof IntegrationRegistryEvents>(
	type: T,
	callback: (detail: IntegrationRegistryEvents[T]['detail']) => void,
): RegistrySubscription {
	const listener = (event: Event) =>
		callback((event as IntegrationRegistryEvents[T]).detail)
	const registry = getRegistry()
	registry.addEventListener(type, listener)
	return {
		unsubscribe: () => registry.removeEventListener(type, listener),
	}
}
