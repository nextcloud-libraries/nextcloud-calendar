/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type {
	IEventEditor,
	IEventEditorEvent,
	IEventEditorEventSaveDetails,
	IEventEditorExtension,
	IEventEditorExtensionContext,
	IEventEditorExtensionId,
} from './ui/event-editor/index.ts'

export {
	getEventEditorExtensions,
	onEventEditorExtensionRegistered,
	onEventEditorExtensionUnregistered,
	registerEventEditorExtension,
	unregisterEventEditorExtension,
} from './ui/event-editor/index.ts'
