<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Contributing

Contributions follow the Nextcloud
[Contribution Guidelines](https://github.com/nextcloud-libraries/.github/blob/main/CONTRIBUTING.md)
and the [AI Contribution Policy](https://github.com/nextcloud-libraries/.github/blob/main/AI_POLICY.md).

## Decisions

Read [DECISIONS.md](DECISIONS.md) before making changes,
and add an entry for each decision you make.

## Development

```sh
npm ci
npm run build       # Build to dist/
npm run lint        # Lint and check formatting, or lint:fix to fix both
npm run format      # Format code and Markdown
npm run ts:check    # Type check
npm test            # Run tests, or test:watch
```

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org), e.g. `feat: add setProperty to event`.

- Sign off every commit (`git commit -s`) to certify the Developer Certificate of Origin.
  Only humans sign off.
- Add an `Assisted-by: AGENT_NAME:MODEL_VERSION` trailer to commits with AI-assisted content,
  e.g. `Assisted-by: ClaudeCode:claude-opus-5-5`.
