/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type {
	EventEditor,
	EventEditorEvent,
	EventEditorExtension,
	EventEditorExtensionContext,
} from './ui/event-editor/index.ts'

export {
	getEventEditorExtensions,
	onEventEditorExtensionRegistered,
	onEventEditorExtensionUnregistered,
	registerEventEditorExtension,
} from './ui/event-editor/index.ts'
