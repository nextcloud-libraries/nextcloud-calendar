/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Which occurrences of an event are saved.
 *
 * - `series`: the whole event, with all its occurrences.
 * - `occurrence`: only the edited occurrence.
 * - `future`: the edited occurrence and all following ones.
 */
export type EventEditorEventSaveScope = 'series' | 'occurrence' | 'future'

/**
 * Details of saving an event.
 */
export interface IEventEditorEventSaveDetails {
	/** Which occurrences of the event are saved */
	scope: EventEditorEventSaveScope
}

/**
 * Subscription returned by `onSave`.
 */
export interface IEventEditorEventSaveSubscription {
	/**
	 * Stop calling the callback. Calling it more than once does nothing.
	 */
	unsubscribe(): void
}

/**
 * Options of `onSave`.
 */
export interface EventEditorEventSaveSubscriptionOptions {
	/** Called with the save details */
	callback: (details: IEventEditorEventSaveDetails) => void
}

/**
 * Property to set on an event.
 */
export interface EventEditorEventProperty {
	/** Name of the iCalendar property, e.g. `X-MYAPP-EXAMPLE` */
	name: string
	/** Value of the property */
	value: string
}

/**
 * Result of `setProperty`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- members might be added later
export interface IEventEditorEventSetPropertyResult {}

/**
 * Event being edited in the event editor.
 */
export interface IEventEditorEvent {
	/**
	 * Register a callback that is called before the event is saved.
	 * Changes made to the event in the callback are saved with it.
	 *
	 * @param options - The callback to register
	 * @return The subscription of the callback
	 */
	onSave(
		options: EventEditorEventSaveSubscriptionOptions,
	): IEventEditorEventSaveSubscription

	/**
	 * Set a property of the event, replacing any property with the same name.
	 * The change is saved with the event.
	 *
	 * @param property - The property to set
	 * @return The result of setting the property
	 */
	setProperty(
		property: EventEditorEventProperty,
	): IEventEditorEventSetPropertyResult
}
