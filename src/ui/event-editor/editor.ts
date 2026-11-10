/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Field to add to the event editor.
 */
export interface EventEditorFieldOptions {
	/** Icon shown in front of the field, like the icons of the other properties of the event. No icon is shown if omitted. */
	icon?: HTMLElement
	/** The field itself */
	field: HTMLElement
}

/**
 * Field added to the event editor, returned by `addField`.
 */
export interface IEventEditorField {
	/**
	 * Remove the field from the editor.
	 * Does nothing if it was already removed.
	 */
	remove(): void
}

/**
 * Event editor an extension is set up in.
 */
export interface IEventEditor {
	/**
	 * Add a field to the editor, shown below the description.
	 * The fields of an extension are removed when the editor is closed
	 * or the extension is removed from it.
	 *
	 * @param options - The field to add
	 * @return The added field
	 */
	addField(options: EventEditorFieldOptions): IEventEditorField
}
