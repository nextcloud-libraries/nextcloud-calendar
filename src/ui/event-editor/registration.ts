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
export type ExtensionKey = string

/**
 * Registry event dispatched after an extension was registered, with the extension as detail.
 */
export type RegisterEvent = CustomEvent<EventEditorExtension>

/**
 * Registry event dispatched after an extension was unregistered, with its id as detail.
 */
export type UnregisterEvent = CustomEvent<EventEditorExtensionId>

/**
 * Result of {@link registerEventEditorExtension}: the registration of the extension.
 */
export interface RegisterExtensionResult {
	/**
	 * Unregister the extension again. Calling it more than once does nothing.
	 */
	unregister(): void
}

/**
 * Options of {@link onEventEditorExtensionRegistered}.
 */
export interface OnExtensionRegisteredOptions {
	/** Called with the registered extension */
	callback: (extension: EventEditorExtension) => void
}

/**
 * Options of {@link onEventEditorExtensionUnregistered}.
 */
export interface OnExtensionUnregisteredOptions {
	/** Called with the id of the unregistered extension */
	callback: (id: EventEditorExtensionId) => void
}

/**
 * Result of {@link onEventEditorExtensionRegistered}: the subscription of the callback.
 */
export interface OnExtensionRegisteredResult {
	/**
	 * Stop calling the callback. Calling it more than once does nothing.
	 */
	unsubscribe(): void
}

/**
 * Result of {@link onEventEditorExtensionUnregistered}: the subscription of the callback.
 */
export interface OnExtensionUnregisteredResult {
	/**
	 * Stop calling the callback. Calling it more than once does nothing.
	 */
	unsubscribe(): void
}

/**
 * Integration registry events of event editor extensions, by event name.
 */
export interface IntegrationRegistryEvents {
	'register:eventEditorExtension': RegisterEvent
	'unregister:eventEditorExtension': UnregisterEvent
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
function toKey(id: EventEditorExtensionId): ExtensionKey {
	return JSON.stringify([id.app, id.name])
}

/**
 * Register an extension for the event editor.
 *
 * @param extension - The extension to register
 * @return The registration of the extension
 * @throws {TypeError} If the extension is not an object, the app or the name is not a non-empty string, or {@link EventEditorExtension.setup} is not a function
 * @throws {Error} If an extension with the same id is already registered
 */
export function registerEventEditorExtension(
	extension: EventEditorExtension,
): RegisterExtensionResult {
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
 * Result of {@link getEventEditorExtensions}.
 */
export interface GetExtensionsResult {
	/** Copy of the registered extensions in registration order */
	extensions: EventEditorExtension[]
}

/**
 * Get all registered event editor extensions.
 *
 * @return The registered extensions
 */
export function getEventEditorExtensions(): GetExtensionsResult {
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
}: OnExtensionRegisteredOptions): OnExtensionRegisteredResult {
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
}: OnExtensionUnregisteredOptions): OnExtensionUnregisteredResult {
	return addRegistryListener('unregister:eventEditorExtension', callback)
}
