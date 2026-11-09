/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Details of saving an event.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- details might be added later
export interface IEventEditorEventSaveDetails {}

/**
 * Event being edited in the event editor.
 */
export interface IEventEditorEvent {
	/**
	 * Register a callback that is called before the event is saved.
	 * Changes made to the event in the callback are saved with it.
	 *
	 * @param callback - Called with the save details
	 */
	onSave(callback: (details: IEventEditorEventSaveDetails) => void): void
}
