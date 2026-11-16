/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Result of {@link EventEditorEvent.onSave}: the subscription of the callback.
 */
export interface OnSaveResult {
	/**
	 * Stop calling the callback. Calling it more than once does nothing.
	 */
	unsubscribe(): void
}

/**
 * Options of {@link EventEditorEvent.onSave}.
 */
export interface OnSaveOptions {
	/** Called before the event is saved */
	callback: () => void
}

/**
 * Options of {@link EventEditorEvent.setProperty}: the property to set on the event.
 */
export interface SetPropertyOptions {
	/** Name of the iCalendar property, e.g. `X-MYAPP-EXAMPLE` */
	name: string
	/** Value of the property */
	value: string
}

/**
 * Event being edited in the event editor.
 */
export interface EventEditorEvent {
	/**
	 * Register a callback that is called before the event is saved.
	 * Changes made to the event in the callback are saved with it.
	 *
	 * @param options - The callback to register
	 * @return The subscription of the callback
	 */
	onSave(options: OnSaveOptions): OnSaveResult

	/**
	 * Set a property of the event.
	 * It replaces any property with the same name.
	 * The change is saved with the event.
	 *
	 * Currently, only properties starting with `X-` can be set.
	 * More properties might be allowed in the future.
	 * Properties starting with `X-NC-` are reserved for Nextcloud and cannot be set.
	 * Names are case-insensitive.
	 *
	 * @param property - The property to set
	 */
	setProperty(property: SetPropertyOptions): void
}
