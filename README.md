<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

# @nextcloud/calendar

Extension API of the [Nextcloud Calendar](https://github.com/nextcloud/calendar) app.
Other Nextcloud apps use it to extend the calendar, starting with the event editor.

> [!WARNING]
> This library is a pre-release and not yet implemented in the Calendar app.
> Extensions registered with it have no effect yet, and the API may still change between any versions.
> Follow the progress in [nextcloud/calendar#8522](https://github.com/nextcloud/calendar/issues/8522).

## Installation

```sh
npm install @nextcloud/calendar
```

## Examples

### Extending the event editor

```ts
import { registerEventEditorExtension } from '@nextcloud/calendar'

const registration = registerEventEditorExtension({
	app: 'myapp',
	name: 'my-field',
	setup({ event, editor }) {
		const icon = document.createElement('span')
		const field = document.createElement('input')

		editor.addField({ icon, field })

		event.onSave({
			callback: () => {
				event.setProperty({ name: 'X-MYAPP-VALUE', value: field.value })
			},
		})
	},
})

// Remove the extension again
registration.unregister()
```

## Features & Roadmap

| Version | Feature                                  | API                            | Calendar |
| ------- | ---------------------------------------- | ------------------------------ | -------- |
| 0.0.1-0 | Register extensions for the event editor | `registerEventEditorExtension` | –        |
| 0.0.1-0 | Add own fields to the event editor       | `addField`                     | –        |
| 0.0.1-0 | Update the event before it is saved      | `onSave`                       | –        |
| 0.0.1-0 | Set properties of the event              | `setProperty`                  | –        |

- **Version**: first version of this library with the feature. Unreleased versions are planned.
- **Calendar**: first Calendar app version that implements the feature, `–` if none yet.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[AGPL-3.0-or-later](LICENSE)
