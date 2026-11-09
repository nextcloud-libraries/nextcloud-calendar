/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Event editor an extension is set up in.
 */
export interface IEventEditor {
	/**
	 * Register a callback that is called when the editor is closed
	 * or the extension is removed from it.
	 *
	 * @param callback - Called once on dispose
	 */
	onDispose(callback: () => void): void
}
