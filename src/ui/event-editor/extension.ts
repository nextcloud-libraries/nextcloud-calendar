/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IEventEditor } from './editor.ts'
import type { IEventEditorEvent } from './event.ts'

/**
 * Identifies an event editor extension.
 */
export interface IEventEditorExtensionId {
	/** Id of the Nextcloud app providing the extension */
	app: string
	/** Name of the extension, unique within the app */
	name: string
}

/**
 * Context an extension is set up in.
 */
export interface IEventEditorExtensionContext {
	/** The event being edited */
	event: IEventEditorEvent
	/** The editor the event is edited in */
	editor: IEventEditor
}

/**
 * Extension of the event editor.
 */
export interface IEventEditorExtension extends IEventEditorExtensionId {
	/**
	 * Set up the extension in an event editor.
	 *
	 * May be async.
	 * When it is called and whether the editor waits for it is unspecified.
	 *
	 * @param ctx - The context to set up the extension in
	 */
	setup(ctx: IEventEditorExtensionContext): void | Promise<void>
}
