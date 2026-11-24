<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

# @nextcloud/calendar-integration

Integration API for the [Nextcloud Calendar](https://github.com/nextcloud/calendar) app.

> [!WARNING]
> The first version of this library is still in development.
> The API may change between any versions until then.

## Installation

```sh
npm install @nextcloud/calendar-integration
```

## Usage

### Extending the event editor

Load the script of your extension when the Calendar app loads the event editor,
by listening for its `BeforeEventEditorLoadedEvent` in your app:

```php
// lib/AppInfo/Application.php
use OCA\Calendar\Events\BeforeEventEditorLoadedEvent;
use OCA\MyApp\Listener\BeforeEventEditorLoadedListener;

public function register(IRegistrationContext $context): void {
	$context->registerEventListener(BeforeEventEditorLoadedEvent::class, BeforeEventEditorLoadedListener::class);
}
```

```php
// lib/Listener/BeforeEventEditorLoadedListener.php
namespace OCA\MyApp\Listener;

use OCA\Calendar\Events\BeforeEventEditorLoadedEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

class BeforeEventEditorLoadedListener implements IEventListener {
	public function handle(Event $event): void {
		if (!$event instanceof BeforeEventEditorLoadedEvent) {
			return;
		}
		Util::addScript('myapp', 'myapp-event-editor');
	}
}
```

In that script, register the extension:

```ts
// src/event-editor.ts
import { registerEventEditorExtension } from '@nextcloud/calendar-integration'

const registration = registerEventEditorExtension({
	app: 'myapp',
	name: 'my-field',
	setup({ event, editor }) {
		const icon = document.createElement('div')
		// … e.g. render an icon into it

		const field = document.createElement('div')
		let value = ''
		// … render your input into it, e.g. with a component of @nextcloud/vue, and keep `value` up to date

		editor.addField({ icon, field })

		event.onSave({
			callback: () => {
				event.setProperty({ name: 'X-MYAPP-VALUE', value })
			},
		})
	},
})

// Remove the extension again
registration.unregister()
```

## Features & Roadmap

### Implemented

| Feature                                  | API                            |
| ---------------------------------------- | ------------------------------ |
| Register extensions for the event editor | `registerEventEditorExtension` |
| Add own fields to the event editor       | `addField`                     |
| Follow how the event editor is shown     | `view`, `onViewChange`         |
| Know how the user may change the event   | `access`                       |
| Update the event before it is saved      | `onSave`                       |
| Set custom properties of the event       | `setProperty`                  |

> [!NOTE]
> Custom properties are the non-standard iCalendar properties whose names start with `X-`, e.g. `X-MYAPP-VALUE`.
> Extensions can currently only set these, with text values.
> Properties starting with `X-NC-` are currently also reserved for Nextcloud and cannot be set.
> Standard properties, e.g. `LOCATION` or `DESCRIPTION`, cannot be set either.

### Upcoming

- Read the values of properties
- Subscribe to changes of property values
- Read, set and subscribe to standard properties, e.g. `LOCATION`, and Nextcloud properties starting with `X-NC-`
- Add custom options for attendees, e.g. to make an attendee a co-organizer
  and more places in the event editor, such as the sidebar
- Know what is being edited, i.e. a single occurrence, the whole series, or this and all future occurrences
- More control over the position of fields, e.g. their order
- Hide or replace built-in fields of the event editor

### Under consideration

Ideas that might come later, and might still change or be dropped.

- Async setup of extensions
- Hooks when the event editor is closed
- Set property values of other types than text, e.g. dates
- Remove properties
- Read and set properties with several values, e.g. `CATEGORIES`
- Read and set property parameters, e.g. `CN` or `ROLE` of an attendee
- Read and set sub-components, e.g. alarms (`VALARM`)
- Read information about the calendar of the event, e.g. its ID and name

## License

[AGPL-3.0-or-later](LICENSE)
