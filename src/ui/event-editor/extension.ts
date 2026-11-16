/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EventEditor } from './editor.ts'
import type { EventEditorEvent } from './event.ts'

/**
 * Identifies an event editor extension.
 */
export interface EventEditorExtensionId {
	/** Id of the Nextcloud app providing the extension */
	app: string
	/** Name of the extension, unique within the app */
	name: string
}

/**
 * Context passed to {@link EventEditorExtension.setup}: the event and editor the extension is set up in.
 */
export interface EventEditorExtensionContext {
	/** The event being edited */
	readonly event: EventEditorEvent
	/** The editor the event is edited in */
	readonly editor: EventEditor
}

/**
 * Extension of the event editor.
 */
export interface EventEditorExtension {
	/** Id of the Nextcloud app providing the extension */
	app: string
	/** Name of the extension, unique within the app */
	name: string

	/**
	 * Set up the extension in an event editor.
	 *
	 * Called once an editor opens an event.
	 *
	 * @param ctx - The context to set up the extension in
	 */
	setup(ctx: EventEditorExtensionContext): void
}
