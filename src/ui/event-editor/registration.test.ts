/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IEventEditorExtension, IEventEditorExtensionId } from './extension.ts'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getScopedGlobals } from '../../globalScope.ts'
import {
	getEventEditorExtensions,
	onEventEditorExtensionRegistered,
	onEventEditorExtensionUnregistered,
	registerEventEditorExtension,
	unregisterEventEditorExtension,
} from './registration.ts'

function createExtension(name: string, app = 'test'): IEventEditorExtension {
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
			expect(getEventEditorExtensions()).toEqual([])
		})

		it('returns registered extensions in registration order', () => {
			const first = createExtension('first')
			const second = createExtension('second', 'other')
			const third = createExtension('third')
			registerEventEditorExtension(first)
			registerEventEditorExtension(second)
			registerEventEditorExtension(third)

			expect(getEventEditorExtensions()).toEqual([first, second, third])
		})

		it('returns a copy that does not affect the registry when modified', () => {
			registerEventEditorExtension(createExtension('ext'))

			getEventEditorExtensions().pop()

			expect(getEventEditorExtensions()).toHaveLength(1)
		})
	})

	describe('registerEventEditorExtension', () => {
		it('stores the extension in the global scope under `["<app>","<name>"]`', () => {
			const extension = createExtension('ext')
			registerEventEditorExtension(extension)

			expect(globalThis._nc_calendar_scope?.v0_0?.eventEditorExtension).toBeInstanceOf(Map)
			expect(getScopedGlobals().eventEditorExtension?.get('["test","ext"]')).toBe(extension)
		})

		it('throws when an extension with the same app and name is already registered', () => {
			const original = createExtension('ext')
			registerEventEditorExtension(original)

			expect(() => registerEventEditorExtension(createExtension('ext')))
				.toThrow('Extension `ext` of app `test` already registered.')
			expect(getEventEditorExtensions()).toEqual([original])
		})

		it('allows the same name in different apps', () => {
			const first = createExtension('ext', 'first')
			const second = createExtension('ext', 'second')
			registerEventEditorExtension(first)
			registerEventEditorExtension(second)

			expect(getEventEditorExtensions()).toEqual([first, second])
		})

		it('keeps ids apart that only differ in where a separator-like character is', () => {
			const first = createExtension('c', 'a:b')
			const second = createExtension('b:c', 'a')
			const third = createExtension('"],["x', 'a\\')
			registerEventEditorExtension(first)
			registerEventEditorExtension(second)
			registerEventEditorExtension(third)

			expect(getEventEditorExtensions()).toEqual([first, second, third])
		})

		it('notifies registered callbacks with the extension', () => {
			const callback = vi.fn()
			onEventEditorExtensionRegistered(callback)
			const extension = createExtension('ext')

			registerEventEditorExtension(extension)

			expect(callback).toHaveBeenCalledExactlyOnceWith(extension)
		})

		it('does not notify registered callbacks for a duplicate', () => {
			registerEventEditorExtension(createExtension('ext'))
			const callback = vi.fn()
			onEventEditorExtensionRegistered(callback)

			expect(() => registerEventEditorExtension(createExtension('ext'))).toThrow()
			expect(callback).not.toHaveBeenCalled()
		})

		it.each([
			['a missing app', { name: 'ext', setup: () => {} }, 'Extension `app` must be a non-empty string.'],
			['an empty app', { app: '', name: 'ext', setup: () => {} }, 'Extension `app` must be a non-empty string.'],
			['a non-string app', { app: 1, name: 'ext', setup: () => {} }, 'Extension `app` must be a non-empty string.'],
			['a missing name', { app: 'test', setup: () => {} }, 'Extension `name` must be a non-empty string.'],
			['an empty name', { app: 'test', name: '', setup: () => {} }, 'Extension `name` must be a non-empty string.'],
			['a missing setup', { app: 'test', name: 'ext' }, 'Extension `setup` must be a function.'],
			['a non-function setup', { app: 'test', name: 'ext', setup: 'setup' }, 'Extension `setup` must be a function.'],
			['undefined', undefined, 'Extension must be an object.'],
			['null', null, 'Extension must be an object.'],
			['a string', 'test:ext', 'Extension must be an object.'],
		])('throws for %s without registering or notifying', (_, extension, message) => {
			const callback = vi.fn()
			onEventEditorExtensionRegistered(callback)

			expect(() => registerEventEditorExtension(extension as unknown as IEventEditorExtension))
				.toThrow(new TypeError(message))
			expect(getEventEditorExtensions()).toEqual([])
			expect(callback).not.toHaveBeenCalled()
		})
	})

	describe('unregisterEventEditorExtension', () => {
		it.each([
			['a missing app', { name: 'ext' }, 'Extension `app` must be a non-empty string.'],
			['an empty app', { app: '', name: 'ext' }, 'Extension `app` must be a non-empty string.'],
			['a missing name', { app: 'test' }, 'Extension `name` must be a non-empty string.'],
			['an empty name', { app: 'test', name: '' }, 'Extension `name` must be a non-empty string.'],
			['undefined', undefined, 'Extension id must be an object.'],
			['null', null, 'Extension id must be an object.'],
		])('throws for %s without unregistering or notifying', (_, id, message) => {
			const registered = createExtension('ext')
			registerEventEditorExtension(registered)
			const callback = vi.fn()
			onEventEditorExtensionUnregistered(callback)

			expect(() => unregisterEventEditorExtension(id as IEventEditorExtensionId))
				.toThrow(new TypeError(message))
			expect(getEventEditorExtensions()).toEqual([registered])
			expect(callback).not.toHaveBeenCalled()
		})

		it('removes a registered extension', () => {
			const kept = createExtension('kept')
			registerEventEditorExtension(kept)
			registerEventEditorExtension(createExtension('removed'))

			unregisterEventEditorExtension({ app: 'test', name: 'removed' })

			expect(getEventEditorExtensions()).toEqual([kept])
		})

		it('only removes the extension of the given app', () => {
			const kept = createExtension('ext', 'kept')
			registerEventEditorExtension(kept)
			registerEventEditorExtension(createExtension('ext', 'removed'))

			unregisterEventEditorExtension({ app: 'removed', name: 'ext' })

			expect(getEventEditorExtensions()).toEqual([kept])
		})

		it('allows registering the same app and name again after unregistering', () => {
			registerEventEditorExtension(createExtension('ext'))
			unregisterEventEditorExtension({ app: 'test', name: 'ext' })

			const replacement = createExtension('ext')
			expect(() => registerEventEditorExtension(replacement)).not.toThrow()
			expect(getEventEditorExtensions()).toEqual([replacement])
		})

		it('does not throw for an unknown extension', () => {
			const unknown = { app: 'test', name: 'unknown' }
			expect(() => unregisterEventEditorExtension(unknown)).not.toThrow()
			registerEventEditorExtension(createExtension('ext'))
			expect(() => unregisterEventEditorExtension(unknown)).not.toThrow()
			expect(getEventEditorExtensions()).toHaveLength(1)
		})

		it('notifies unregistered callbacks with the app and name', () => {
			registerEventEditorExtension(createExtension('ext'))
			const callback = vi.fn()
			onEventEditorExtensionUnregistered(callback)

			unregisterEventEditorExtension({ app: 'test', name: 'ext' })

			expect(callback).toHaveBeenCalledExactlyOnceWith({ app: 'test', name: 'ext' })
		})

		it('does not remove an extension whose app and name only join to the same string', () => {
			const kept = createExtension('b:c', 'a')
			registerEventEditorExtension(kept)
			registerEventEditorExtension(createExtension('c', 'a:b'))

			unregisterEventEditorExtension({ app: 'a:b', name: 'c' })

			expect(getEventEditorExtensions()).toEqual([kept])
		})

		it('does not notify unregistered callbacks for an unknown extension', () => {
			const callback = vi.fn()
			onEventEditorExtensionUnregistered(callback)

			unregisterEventEditorExtension({ app: 'test', name: 'unknown' })
			registerEventEditorExtension(createExtension('ext'))
			unregisterEventEditorExtension({ app: 'test', name: 'unknown' })

			expect(callback).not.toHaveBeenCalled()
		})

		it('notifies unregistered callbacks only once when unregistering twice', () => {
			registerEventEditorExtension(createExtension('ext'))
			const callback = vi.fn()
			onEventEditorExtensionUnregistered(callback)

			unregisterEventEditorExtension({ app: 'test', name: 'ext' })
			unregisterEventEditorExtension({ app: 'test', name: 'ext' })

			expect(callback).toHaveBeenCalledOnce()
		})
	})

	describe('onEventEditorExtensionRegistered', () => {
		it('stops notifying after the returned function is called', () => {
			const callback = vi.fn()
			const off = onEventEditorExtensionRegistered(callback)

			off()
			registerEventEditorExtension(createExtension('ext'))

			expect(callback).not.toHaveBeenCalled()
		})

		it('is not called on unregister', () => {
			registerEventEditorExtension(createExtension('ext'))
			const callback = vi.fn()
			onEventEditorExtensionRegistered(callback)

			unregisterEventEditorExtension({ app: 'test', name: 'ext' })

			expect(callback).not.toHaveBeenCalled()
		})
	})

	describe('onEventEditorExtensionUnregistered', () => {
		it('stops notifying after the returned function is called', () => {
			registerEventEditorExtension(createExtension('ext'))
			const callback = vi.fn()
			const off = onEventEditorExtensionUnregistered(callback)

			off()
			unregisterEventEditorExtension({ app: 'test', name: 'ext' })

			expect(callback).not.toHaveBeenCalled()
		})

		it('is not called on register', () => {
			const callback = vi.fn()
			onEventEditorExtensionUnregistered(callback)

			registerEventEditorExtension(createExtension('ext'))

			expect(callback).not.toHaveBeenCalled()
		})
	})
})
