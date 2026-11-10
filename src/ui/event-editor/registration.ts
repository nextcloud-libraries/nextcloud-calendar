/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditorExtension, EventEditorExtensionId } from './extension.ts'

import { getScopedGlobals } from '../../globalScope.ts'
import { addRegistryListener, dispatchRegistryEvent } from '../../registry.ts'

/**
 * Key of an extension in the global scope: the JSON array `["<app>","<name>"]`.
 */
export type EventEditorExtensionKey = string

/**
 * Registry event dispatched after an extension was registered, with the extension as detail.
 */
export type RegisterEventEditorExtension = CustomEvent<EventEditorExtension>

/**
 * Registry event dispatched after an extension was unregistered, with its id as detail.
 */
export type UnregisterEventEditorExtension = CustomEvent<EventEditorExtensionId>

/**
 * Registration of an event editor extension, returned by `registerEventEditorExtension`.
 */
export interface EventEditorExtensionRegistration {
	/**
	 * Unregister the extension again. Calling it more than once does nothing.
	 */
	unregister(): void
}

/**
 * Options of `onEventEditorExtensionRegistered`.
 */
export interface EventEditorExtensionRegisteredSubscriptionOptions {
	/** Called with the registered extension */
	callback: (extension: EventEditorExtension) => void
}

/**
 * Options of `onEventEditorExtensionUnregistered`.
 */
export interface EventEditorExtensionUnregisteredSubscriptionOptions {
	/** Called with the id of the unregistered extension */
	callback: (id: EventEditorExtensionId) => void
}

/**
 * Subscription returned by `onEventEditorExtensionRegistered`.
 */
export interface EventEditorExtensionRegisteredSubscription {
	/**
	 * Stop calling the callback. Calling it more than once does nothing.
	 */
	unsubscribe(): void
}

/**
 * Subscription returned by `onEventEditorExtensionUnregistered`.
 */
export interface EventEditorExtensionUnregisteredSubscription {
	/**
	 * Stop calling the callback. Calling it more than once does nothing.
	 */
	unsubscribe(): void
}

/**
 * Registry events of event editor extensions, by event name.
 */
export interface EventEditorExtensionRegistryEvents {
	'register:eventEditorExtension': RegisterEventEditorExtension
	'unregister:eventEditorExtension': UnregisterEventEditorExtension
}

/**
 * Check that an extension id is an object with a non-empty app and name.
 *
 * @param id - The id of the extension
 * @throws {TypeError} If the id is not an object, or the app or the name is not a non-empty string
 */
function validateId(id: EventEditorExtensionId): void {
	if (typeof id !== 'object' || id === null) {
		throw new TypeError('Extension id must be an object.')
	}
	if (typeof id.app !== 'string' || id.app === '') {
		throw new TypeError('Extension `app` must be a non-empty string.')
	}
	if (typeof id.name !== 'string' || id.name === '') {
		throw new TypeError('Extension `name` must be a non-empty string.')
	}
}

/**
 * Build the key under which an extension is stored.
 *
 * @param id - The id of the extension
 * @return The `["<app>","<name>"]` key
 */
function toKey(id: EventEditorExtensionId): EventEditorExtensionKey {
	return JSON.stringify([id.app, id.name])
}

/**
 * Register an extension for the event editor.
 *
 * @param extension - The extension to register
 * @return The registration of the extension
 * @throws {TypeError} If the extension is not an object, the app or the name is not a non-empty string, or `setup` is not a function
 * @throws {Error} If an extension with the same id is already registered
 */
export function registerEventEditorExtension(
	extension: EventEditorExtension,
): EventEditorExtensionRegistration {
	if (typeof extension !== 'object' || extension === null) {
		throw new TypeError('Extension must be an object.')
	}
	validateId(extension)
	if (typeof extension.setup !== 'function') {
		throw new TypeError('Extension `setup` must be a function.')
	}

	const { app, name } = extension
	const key = toKey(extension)
	const extensions = (getScopedGlobals().eventEditorExtension ??= new Map())
	if (extensions.has(key)) {
		throw new Error(
			`Extension \`${name}\` of app \`${app}\` already registered.`,
		)
	}

	extensions.set(key, extension)
	dispatchRegistryEvent('register:eventEditorExtension', extension)

	let registered = true
	return {
		unregister: () => {
			if (!registered) {
				return
			}
			registered = false
			const current = getScopedGlobals().eventEditorExtension
			// Only remove this registration, not a later one under the same id
			if (current?.get(key) !== extension) {
				return
			}
			current.delete(key)
			dispatchRegistryEvent('unregister:eventEditorExtension', { app, name })
		},
	}
}

/**
 * Options of `getEventEditorExtensions`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- options might be added later
export interface GetEventEditorExtensionsOptions {}

/**
 * Result of `getEventEditorExtensions`.
 */
export interface GetEventEditorExtensionsResult {
	/** Copy of the registered extensions in registration order */
	extensions: EventEditorExtension[]
}

/**
 * Get all registered event editor extensions.
 *
 * @param _options - Options, none yet
 * @return The registered extensions
 */
export function getEventEditorExtensions(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- options might be added later
	_options?: GetEventEditorExtensionsOptions,
): GetEventEditorExtensionsResult {
	return {
		extensions: [...(getScopedGlobals().eventEditorExtension?.values() ?? [])],
	}
}

/**
 * Register a callback that is called after an event editor extension was registered.
 *
 * @param options - The callback to register
 * @param options.callback - Called with the registered extension
 * @return The subscription of the callback
 */
export function onEventEditorExtensionRegistered({
	callback,
}: EventEditorExtensionRegisteredSubscriptionOptions): EventEditorExtensionRegisteredSubscription {
	return addRegistryListener('register:eventEditorExtension', callback)
}

/**
 * Register a callback that is called after an event editor extension was unregistered.
 *
 * @param options - The callback to register
 * @param options.callback - Called with the id of the unregistered extension
 * @return The subscription of the callback
 */
export function onEventEditorExtensionUnregistered({
	callback,
}: EventEditorExtensionUnregisteredSubscriptionOptions): EventEditorExtensionUnregisteredSubscription {
	return addRegistryListener('unregister:eventEditorExtension', callback)
}
