/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditorExtension } from './extension.ts'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getScopedGlobals } from '../../globalScope.ts'
import {
	getEventEditorExtensions,
	onEventEditorExtensionRegistered,
	onEventEditorExtensionUnregistered,
	registerEventEditorExtension,
} from './registration.ts'

function createExtension(name: string, app = 'test'): EventEditorExtension {
	return {
		app,
		name,
		setup: () => {},
	}
}

describe('event editor extensions', () => {
	beforeEach(() => {
		delete globalThis._nc_calendar_scope
	})

	describe('getEventEditorExtensions', () => {
		it('returns an empty list when nothing is registered', () => {
			expect(getEventEditorExtensions().extensions).toEqual([])
		})

		it('returns registered extensions in registration order', () => {
			const first = createExtension('first')
			const second = createExtension('second', 'other')
			const third = createExtension('third')
			registerEventEditorExtension(first)
			registerEventEditorExtension(second)
			registerEventEditorExtension(third)

			expect(getEventEditorExtensions().extensions).toEqual([
				first,
				second,
				third,
			])
		})

		it('returns a copy that does not affect the registry when modified', () => {
			registerEventEditorExtension(createExtension('ext'))

			getEventEditorExtensions().extensions.pop()

			expect(getEventEditorExtensions().extensions).toHaveLength(1)
		})
	})

	describe('registerEventEditorExtension', () => {
		it('stores the extension in the global scope under `["<app>","<name>"]`', () => {
			const extension = createExtension('ext')
			registerEventEditorExtension(extension)

			expect(
				globalThis._nc_calendar_scope?.v0_0?.eventEditorExtension,
			).toBeInstanceOf(Map)
			expect(
				getScopedGlobals().eventEditorExtension?.get('["test","ext"]'),
			).toBe(extension)
		})

		it('throws when an extension with the same app and name is already registered', () => {
			const original = createExtension('ext')
			registerEventEditorExtension(original)

			expect(() =>
				registerEventEditorExtension(createExtension('ext')),
			).toThrow('Extension `ext` of app `test` already registered.')
			expect(getEventEditorExtensions().extensions).toEqual([original])
		})

		it('allows the same name in different apps', () => {
			const first = createExtension('ext', 'first')
			const second = createExtension('ext', 'second')
			registerEventEditorExtension(first)
			registerEventEditorExtension(second)

			expect(getEventEditorExtensions().extensions).toEqual([first, second])
		})

		it('keeps ids apart that only differ in where a separator-like character is', () => {
			const first = createExtension('c', 'a:b')
			const second = createExtension('b:c', 'a')
			const third = createExtension('"],["x', 'a\\')
			registerEventEditorExtension(first)
			registerEventEditorExtension(second)
			registerEventEditorExtension(third)

			expect(getEventEditorExtensions().extensions).toEqual([
				first,
				second,
				third,
			])
		})

		it('notifies registered callbacks with the extension', () => {
			const callback = vi.fn()
			onEventEditorExtensionRegistered({ callback })
			const extension = createExtension('ext')

			registerEventEditorExtension(extension)

			expect(callback).toHaveBeenCalledExactlyOnceWith(extension)
		})

		it('does not notify registered callbacks for a duplicate', () => {
			registerEventEditorExtension(createExtension('ext'))
			const callback = vi.fn()
			onEventEditorExtensionRegistered({ callback })

			expect(() =>
				registerEventEditorExtension(createExtension('ext')),
			).toThrow()
			expect(callback).not.toHaveBeenCalled()
		})

		it.each([
			[
				'a missing app',
				{ name: 'ext', setup: () => {} },
				'Extension `app` must be a non-empty string.',
			],
			[
				'an empty app',
				{ app: '', name: 'ext', setup: () => {} },
				'Extension `app` must be a non-empty string.',
			],
			[
				'a non-string app',
				{ app: 1, name: 'ext', setup: () => {} },
				'Extension `app` must be a non-empty string.',
			],
			[
				'a missing name',
				{ app: 'test', setup: () => {} },
				'Extension `name` must be a non-empty string.',
			],
			[
				'an empty name',
				{ app: 'test', name: '', setup: () => {} },
				'Extension `name` must be a non-empty string.',
			],
			[
				'a missing setup',
				{ app: 'test', name: 'ext' },
				'Extension `setup` must be a function.',
			],
			[
				'a non-function setup',
				{ app: 'test', name: 'ext', setup: 'setup' },
				'Extension `setup` must be a function.',
			],
			['undefined', undefined, 'Extension must be an object.'],
			['null', null, 'Extension must be an object.'],
			['a string', 'test:ext', 'Extension must be an object.'],
		])(
			'throws for %s without registering or notifying',
			(_, extension, message) => {
				const callback = vi.fn()
				onEventEditorExtensionRegistered({ callback })

				expect(() =>
					registerEventEditorExtension(
						extension as unknown as EventEditorExtension,
					),
				).toThrow(new TypeError(message))
				expect(getEventEditorExtensions().extensions).toEqual([])
				expect(callback).not.toHaveBeenCalled()
			},
		)
	})

	describe('unregister of the registration returned by registerEventEditorExtension', () => {
		it('removes only its own extension', () => {
			const kept = createExtension('kept')
			registerEventEditorExtension(kept)
			const { unregister } = registerEventEditorExtension(
				createExtension('removed'),
			)

			unregister()

			expect(getEventEditorExtensions().extensions).toEqual([kept])
		})

		it('does not remove an extension of another app with the same name', () => {
			const kept = createExtension('ext', 'kept')
			registerEventEditorExtension(kept)
			const { unregister } = registerEventEditorExtension(
				createExtension('ext', 'removed'),
			)

			unregister()

			expect(getEventEditorExtensions().extensions).toEqual([kept])
		})

		it('does not remove an extension whose app and name only join to the same string', () => {
			const kept = createExtension('b:c', 'a')
			registerEventEditorExtension(kept)
			const { unregister } = registerEventEditorExtension(
				createExtension('c', 'a:b'),
			)

			unregister()

			expect(getEventEditorExtensions().extensions).toEqual([kept])
		})

		it('allows registering the same app and name again', () => {
			const { unregister } = registerEventEditorExtension(
				createExtension('ext'),
			)
			unregister()

			const replacement = createExtension('ext')
			expect(() => registerEventEditorExtension(replacement)).not.toThrow()
			expect(getEventEditorExtensions().extensions).toEqual([replacement])
		})

		it('does not remove a later registration with the same app and name', () => {
			const extension = createExtension('ext')
			const { unregister } = registerEventEditorExtension(extension)
			unregister()
			const replacement = createExtension('ext')
			registerEventEditorExtension(replacement)

			unregister()

			expect(getEventEditorExtensions().extensions).toEqual([replacement])
		})

		it('does not remove the same extension object registered again', () => {
			const extension = createExtension('ext')
			const { unregister } = registerEventEditorExtension(extension)
			unregister()
			registerEventEditorExtension(extension)

			unregister()

			expect(getEventEditorExtensions().extensions).toEqual([extension])
		})

		it('notifies unregistered callbacks with the app and name', () => {
			const { unregister } = registerEventEditorExtension(
				createExtension('ext'),
			)
			const callback = vi.fn()
			onEventEditorExtensionUnregistered({ callback })

			unregister()

			expect(callback).toHaveBeenCalledExactlyOnceWith({
				app: 'test',
				name: 'ext',
			})
		})

		it('notifies with the id the extension was registered with, even if it was mutated', () => {
			const extension = createExtension('ext')
			const { unregister } = registerEventEditorExtension(extension)
			const callback = vi.fn()
			onEventEditorExtensionUnregistered({ callback })
			extension.name = 'mutated'

			unregister()

			expect(getEventEditorExtensions().extensions).toEqual([])
			expect(callback).toHaveBeenCalledExactlyOnceWith({
				app: 'test',
				name: 'ext',
			})
		})

		it('notifies unregistered callbacks only once when called twice', () => {
			const { unregister } = registerEventEditorExtension(
				createExtension('ext'),
			)
			const callback = vi.fn()
			onEventEditorExtensionUnregistered({ callback })

			unregister()
			unregister()

			expect(callback).toHaveBeenCalledOnce()
		})
	})

	describe('onEventEditorExtensionRegistered', () => {
		it('stops notifying after the returned function is called', () => {
			const callback = vi.fn()
			const { unsubscribe } = onEventEditorExtensionRegistered({ callback })

			unsubscribe()
			registerEventEditorExtension(createExtension('ext'))

			expect(callback).not.toHaveBeenCalled()
		})

		it('is not called on unregister', () => {
			const { unregister } = registerEventEditorExtension(
				createExtension('ext'),
			)
			const callback = vi.fn()
			onEventEditorExtensionRegistered({ callback })

			unregister()

			expect(callback).not.toHaveBeenCalled()
		})
	})

	describe('onEventEditorExtensionUnregistered', () => {
		it('stops notifying after the returned function is called', () => {
			const { unregister } = registerEventEditorExtension(
				createExtension('ext'),
			)
			const callback = vi.fn()
			const { unsubscribe } = onEventEditorExtensionUnregistered({ callback })

			unsubscribe()
			unregister()

			expect(callback).not.toHaveBeenCalled()
		})

		it('is not called on register', () => {
			const callback = vi.fn()
			onEventEditorExtensionUnregistered({ callback })

			registerEventEditorExtension(createExtension('ext'))

			expect(callback).not.toHaveBeenCalled()
		})
	})
})
