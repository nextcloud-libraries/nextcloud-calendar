/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * How the event editor is shown.
 *
 * - `preview`: the popover viewing the event.
 * - `simple`: the popover editing the event.
 * - `full`: the full editor.
 */
export type EventEditorView = 'preview' | 'simple' | 'full'

/**
 * Access of the current user to the edited event, which determines how they may change it.
 *
 * - `view`: the user can only view the event, e.g. because its calendar is shared read-only.
 * - `respond`: the user is invited to the event by someone else and can respond to the invitation,
 *   but the details of the event are kept as the organizer set them.
 * - `full`: the user organizes the event, or it has no attendees, and can change all of it.
 */
export type EventEditorAccess = 'view' | 'respond' | 'full'

/**
 * Options of {@link EventEditor.addCustomField}: the field to add to the event editor.
 */
export interface AddCustomFieldOptions {
	/** The field itself */
	field: Element
}

/**
 * Result of {@link EventEditor.addCustomField}: the field added to the event editor.
 */
export interface AddCustomFieldResult {
	/**
	 * Remove the field from the editor.
	 * Does nothing if it was already removed.
	 */
	remove(): void
}

/**
 * Details passed to the callbacks of {@link EventEditor.onViewChange}.
 */
export interface OnViewChangeCallbackDetails {
	/** The new view of the editor */
	view: EventEditorView
}

/**
 * Options of {@link EventEditor.onViewChange}.
 */
export interface OnViewChangeOptions {
	/** Called when the view of the editor changes */
	callback: (details: OnViewChangeCallbackDetails) => void
}

/**
 * Result of {@link EventEditor.onViewChange}: the subscription of the callback.
 */
export interface OnViewChangeResult {
	/**
	 * Stop calling the callback. Calling it more than once does nothing.
	 */
	unsubscribe(): void
}

/**
 * Event editor an extension is set up in.
 */
export interface EventEditor {
	/**
	 * How the editor is shown.
	 * Changes while the extension is set up, see {@link EventEditor.onViewChange}.
	 */
	readonly view: EventEditorView

	/**
	 * Access of the current user to the event, which determines how they may change it.
	 * Does not change while the extension is set up.
	 */
	readonly access: EventEditorAccess

	/**
	 * Add a custom field to the editor, which the extension renders itself.
	 *
	 * @param options - The field to add
	 * @return The added field
	 */
	addCustomField(options: AddCustomFieldOptions): AddCustomFieldResult

	/**
	 * Register a callback that is called when the view of the editor changes.
	 *
	 * @param options - The callback to register
	 * @return The subscription of the callback
	 */
	onViewChange(options: OnViewChangeOptions): OnViewChangeResult
}
