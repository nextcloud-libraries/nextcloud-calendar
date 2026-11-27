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
	/** The element rendering the field */
	element: Element
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
 * Options of {@link EventEditor.addTextField}: the text field to add to the event editor.
 */
export interface AddTextFieldOptions {
	/** Label of the field, shown as its placeholder while it is empty and used as its accessible name */
	label: string
	/** Initial value of the field. Empty if omitted. */
	value?: string
}

/**
 * Details passed to the callbacks of {@link AddTextFieldResult.onChange}.
 */
export interface OnTextFieldChangeCallbackDetails {
	/** The new value of the field */
	value: string
}

/**
 * Options of {@link AddTextFieldResult.onChange}.
 */
export interface OnTextFieldChangeOptions {
	/** Called when the user changes the value of the field */
	callback: (details: OnTextFieldChangeCallbackDetails) => void
}

/**
 * Result of {@link AddTextFieldResult.onChange}: the subscription of the callback.
 */
export interface OnTextFieldChangeResult {
	/**
	 * Stop calling the callback. Calling it more than once does nothing.
	 */
	unsubscribe(): void
}

/**
 * Result of {@link EventEditor.addTextField}: the text field added to the event editor.
 */
export interface AddTextFieldResult {
	/**
	 * Current value of the field.
	 * Changes when the user edits the field, see {@link AddTextFieldResult.onChange}, or when it is set with {@link AddTextFieldResult.setValue}.
	 */
	readonly value: string

	/**
	 * Set the value of the field.
	 * Does not call the callbacks of {@link AddTextFieldResult.onChange}, as those are only called for changes by the user.
	 * Does nothing if the field was removed.
	 *
	 * @param value - The new value
	 */
	setValue(value: string): void

	/**
	 * Register a callback that is called when the user changes the value of the field.
	 *
	 * @param options - The callback to register
	 * @return The subscription of the callback
	 */
	onChange(options: OnTextFieldChangeOptions): OnTextFieldChangeResult

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
	 * Add a text field to the editor, rendered and styled like the built-in text properties of the event, e.g. the location.
	 * Unlike {@link EventEditor.addCustomField}, the editor renders the input itself and the extension only sets and follows its value.
	 *
	 * The field is read-only if the user cannot change the details of the event, see {@link EventEditor.access}.
	 * The value is not stored in the event by the editor;
	 * set it as a property with {@link EventEditorEvent.setProperty}, e.g. in a callback of {@link AddTextFieldResult.onChange}.
	 *
	 * @param options - The text field to add
	 * @return The added text field
	 */
	addTextField(options: AddTextFieldOptions): AddTextFieldResult

	/**
	 * Register a callback that is called when the view of the editor changes.
	 *
	 * @param options - The callback to register
	 * @return The subscription of the callback
	 */
	onViewChange(options: OnViewChangeOptions): OnViewChangeResult
}
