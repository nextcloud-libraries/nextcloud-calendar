<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Decision Log

Decisions about this library, for human and AI contributors.
It loosely follows [Architectural Decision Records (ADRs)](https://adr.github.io/), kept in a single file.

- Append new entries at the end with the next number.
- Never rewrite an accepted entry. To change it, add a new entry with `Supersedes` and a link to the old one,
  and only change the status of the old one to `Superseded by` and a link to the new one,
  e.g. `Supersedes [#2. Judge compatibility from the consumers only](#2-judge-compatibility-from-the-consumers-only)`.
- Write the decision and consequences so they are complete without looking up the linked issues or pull requests.

Statuses: `Proposed`, `Accepted`, `Superseded by` a linked entry, `Rejected`.
`Proposed` entries are open for discussion; once decided, their status changes to `Accepted` or `Rejected`.

## 1. Record decisions in this file

- Status: Proposed · 2026-11-10
- Context: Human and AI contributors need to know past decisions and their reasons, without searching pull requests.
- Decision: Record decisions in this single file. Contributors add an entry for each decision they make.
- Consequences: Decisions can be found, searched and linked in one place.
  The file grows with every decision, so entries are kept short.

## 2. Judge compatibility from the consumers only

- Status: Proposed · 2026-11-10
- Context: The API has consumers (extensions and the Calendar app calling exported functions) and implementers (the Calendar app implementing `IEventEditor` and `IEventEditorEvent`).
- Decision: A change is breaking only if it breaks consumers. Breaking implementers is always fine.
- Consequences, for example (not a complete list):
    - Non-breaking: returning something from a method that returned `void`.
    - Non-breaking: adding members to returned objects.
    - Non-breaking: adding optional parameter fields.
    - Breaking: removing or renaming.
    - Breaking: making a parameter field required.
    - Breaking: narrowing a parameter type.
    - Breaking: adding values to a type consumers receive.

## 3. `I` prefix only for interfaces the Calendar app implements

- Status: Proposed · 2026-11-10
- Context: Some types are implemented by the extension host, the Calendar app, e.g. the editor and event passed to an extension.
  Others are implemented by extensions or by this library, or are data that extensions pass in.
- Decision: Only interfaces that the Calendar app implements are named `I…`, e.g. `IEventEditor` and `IEventEditorEvent`.
  All other types have no prefix, e.g. `EventEditorEventSaveScope`.
- Consequences: The prefix shows which types the Calendar app implements, where breaking implementers is fine (see #2).

## 4. Parameters and return values are objects

- Status: Proposed · 2026-11-10
- Context: Adding a field to an object is non-breaking for consumers (see #2),
  but adding a positional parameter, or turning a returned function or primitive into something richer, can break them.
- Decision: Functions take their input as one object and return objects,
  e.g. `setProperty({ name, value })` and `addField({ icon, field })` returning `{ remove }`.
  This includes functions that take a callback, e.g. `onSave({ callback })`.
  Functions without input yet still take an optional, empty options object, e.g. `getEventEditorExtensions(options?)`.
  Functions without output yet still return an empty object, e.g. `setProperty`, and lists are returned in an object, e.g. `{ extensions }`.
  There are no exceptions.
- Consequences:
    - Good: fields can be added to inputs and return values without breaking consumers.
    - Bad: calls are more verbose, e.g. `registration.unregister()` instead of `unregister()`.

## 5. Undo through returned objects

- Status: Proposed · 2026-11-10
- Context: Registering extensions, subscribing to callbacks and adding fields need a way to undo them.
- Decision: The returned object has a method to undo, e.g. `addField` returns `{ remove }`.
  Calling it more than once does nothing.
- Consequences:
    - Good: one consistent pattern for undoing.
    - Good: consumers do not need to keep IDs or pass the same object or function again to undo.
    - Bad: consumers need to keep a reference to the returned object until they undo.

## 6. A dedicated type for each parameter and return object

- Status: Proposed · 2026-11-10
- Context: Types that look alike now may be extended differently later.
- Decision: Each function gets its own types for parameter and return objects,
  e.g. `EventEditorExtensionRegisteredSubscription` and `EventEditorExtensionUnregisteredSubscription`, not a shared `Subscription`.
  Shared internal types, like `RegistrySubscription`, are not exported.
- Consequences: More exported types, each of which can be extended on its own.

## 7. Registry shared through a versioned global

- Status: Proposed · 2026-11-10
- Context: Every app bundles its own copy of this library, and all copies on a page must see the same extensions.
- Decision: The registry lives in `globalThis._nc_calendar_scope.v0_0`.
- Consequences: Copies with incompatible versions can use a different scope key.

## 8. Allow breaking changes during the pre-release

- Status: Proposed · 2026-11-10
- Context: The API is still being designed, and no Calendar app version implements it yet.
- Decision: Until the first stable release, any version may contain breaking changes.
- Consequences:
    - Good: the API can still be reworked freely.
    - Bad: published releases of extensions and the Calendar app should not depend on a pre-release,
      because an extension and the Calendar app on the same page may use incompatible pre-releases.
