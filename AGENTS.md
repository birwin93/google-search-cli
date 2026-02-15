# AGENTS.md

Project guidance for coding agents working in this repository.

## Scope

- Bun + TypeScript CLI for flight search workflows.
- Current provider namespace: `google-flights`.
- Backend data source: SerpAPI `google_flights` engine.

## Quick Start

- Install: `bun install`
- Typecheck: `bun run check`
- CLI help: `bun run src/index.ts --help`
- Provider help: `bun run src/index.ts google-flights --help`

## Command Structure

- Root command: `flights-cli`
- Provider command: `google-flights`
- Actions:
  - `search`: raw JSON payload
  - `list`: ranked table output

## Skill Packaging

- Skill source: `skills/google-search-cli/SKILL.md`
- Packaging ignore list: `skills/google-search-cli/.clawhubignore`
- Keep command examples and SKILL.md examples aligned so published docs stay accurate.

Suggested local OpenClaw setup:

```bash
cp -R skills/google-search-cli ~/.openclaw/workspace/skills/
```

Examples:

```bash
bun run src/index.ts google-flights search --from SFO --to RSW --date 3/25 --return-date 4/1
bun run src/index.ts google-flights list --from SFO --to RSW --date 3/25 --return-date 4/1 --prefer-airline united --prefer-nonstop
```

## Code Map

- `src/index.ts`: root CLI and command registration
- `src/commands/google-flights.ts`: provider namespace command
- `src/commands/search.ts`: search command options + raw output
- `src/commands/list.ts`: list command filters/ranking/table output
- `src/lib/options.ts`: shared input parsing/normalization
- `src/lib/serpapi.ts`: provider request builder + API call
- `src/lib/types.ts`: request/response typings

## ClawHub Publish

- Publish from repo root once the skill file is complete:

```bash
clawhub publish ./skills/google-search-cli --slug google-search-cli --name "Google Search CLI" --version 0.1.0 --changelog "Initial skill setup"
```

## Development Notes

- Keep new provider integrations under their own namespace command.
- Prefer single-request workflows to minimize SerpAPI usage.
- Date inputs should continue supporting `YYYY-MM-DD` and `M/D[/YYYY]`.
- Maintain strict runtime validation for CLI options.
- Do not commit real API keys or secrets.
