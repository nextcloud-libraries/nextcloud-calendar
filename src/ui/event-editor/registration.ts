/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IEventEditorExtension, IEventEditorExtensionId } from './extension.ts'

import { getScopedGlobals } from '../../globalScope.ts'
import { addRegistryListener, dispatchRegistryEvent } from '../../registry.ts'

/**
 * Key of an extension in the global scope: the JSON array `["<app>","<name>"]`.
 */
export type EventEditorExtensionKey = string

/**
 * Registry event dispatched after an extension was registered, with the extension as detail.
 */
export type RegisterEventEditorExtension = CustomEvent<IEventEditorExtension>

/**
 * Registry event dispatched after an extension was unregistered, with its id as detail.
 */
export type UnregisterEventEditorExtension = CustomEvent<IEventEditorExtensionId>

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
function validateId(id: IEventEditorExtensionId): void {
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
function toKey(id: IEventEditorExtensionId): EventEditorExtensionKey {
	return JSON.stringify([id.app, id.name])
}

/**
 * Register an extension for the event editor.
 *
 * @param extension - The extension to register
 * @throws {TypeError} If the extension is not an object, the app or the name is not a non-empty string, or `setup` is not a function
 * @throws {Error} If an extension with the same id is already registered
 */
export function registerEventEditorExtension(extension: IEventEditorExtension): void {
	if (typeof extension !== 'object' || extension === null) {
		throw new TypeError('Extension must be an object.')
	}
	validateId(extension)
	if (typeof extension.setup !== 'function') {
		throw new TypeError('Extension `setup` must be a function.')
	}

	const key = toKey(extension)
	const extensions = (getScopedGlobals().eventEditorExtension ??= new Map())
	if (extensions.has(key)) {
		throw new Error(`Extension \`${extension.name}\` of app \`${extension.app}\` already registered.`)
	}

	extensions.set(key, extension)
	dispatchRegistryEvent('register:eventEditorExtension', extension)
}

/**
 * Unregister a previously registered event editor extension.
 * Does nothing if no such extension is registered.
 *
 * @param id - The id of the extension to unregister
 * @throws {TypeError} If the id is not an object, or the app or the name is not a non-empty string
 */
export function unregisterEventEditorExtension(id: IEventEditorExtensionId): void {
	validateId(id)
	if (!getScopedGlobals().eventEditorExtension?.delete(toKey(id))) {
		return
	}
	dispatchRegistryEvent('unregister:eventEditorExtension', id)
}

/**
 * Get all registered event editor extensions.
 *
 * @return A copy of the registered extensions in registration order
 */
export function getEventEditorExtensions(): IEventEditorExtension[] {
	return [...getScopedGlobals().eventEditorExtension?.values() ?? []]
}

/**
 * Register a callback that is called after an event editor extension was registered.
 *
 * @param callback - Called with the registered extension
 * @return A function that removes the callback again
 */
export function onEventEditorExtensionRegistered(callback: (extension: IEventEditorExtension) => void): () => void {
	return addRegistryListener('register:eventEditorExtension', callback)
}

/**
 * Register a callback that is called after an event editor extension was unregistered.
 *
 * @param callback - Called with the id of the unregistered extension
 * @return A function that removes the callback again
 */
export function onEventEditorExtensionUnregistered(callback: (id: IEventEditorExtensionId) => void): () => void {
	return addRegistryListener('unregister:eventEditorExtension', callback)
}
