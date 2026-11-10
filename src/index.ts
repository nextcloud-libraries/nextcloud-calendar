/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type {
	EventEditorEventProperty,
	EventEditorEventSaveScope,
	EventEditorEventSaveSubscriptionOptions,
	EventEditorExtension,
	EventEditorExtensionId,
	EventEditorExtensionRegisteredSubscription,
	EventEditorExtensionRegisteredSubscriptionOptions,
	EventEditorExtensionRegistration,
	EventEditorExtensionUnregisteredSubscription,
	EventEditorExtensionUnregisteredSubscriptionOptions,
	EventEditorFieldOptions,
	GetEventEditorExtensionsOptions,
	GetEventEditorExtensionsResult,
	IEventEditor,
	IEventEditorEvent,
	IEventEditorEventSaveDetails,
	IEventEditorEventSaveSubscription,
	IEventEditorEventSetPropertyResult,
	IEventEditorExtensionContext,
	IEventEditorField,
} from './ui/event-editor/index.ts'

export {
	getEventEditorExtensions,
	onEventEditorExtensionRegistered,
	onEventEditorExtensionUnregistered,
	registerEventEditorExtension,
} from './ui/event-editor/index.ts'
