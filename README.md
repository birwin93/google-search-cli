# google-flights-cli

Bun + Commander.js flights CLI.

Current provider namespace:

- `google-flights` (via SerpAPI)

## Requirements

- Bun 1.2+
- SerpAPI key (Google Flights engine): https://serpapi.com/google-flights-api

## Install

```bash
bun install
```

## Auth

```bash
export SERPAPI_KEY="your_key_here"
```

You can also pass `--api-key` per command.

## Command Structure

```bash
bun run src/index.ts <provider> <action> [...options]
```

Today:

```bash
bun run src/index.ts google-flights search ...
bun run src/index.ts google-flights list ...
```

## `google-flights search` (raw JSON)

Single request, raw provider payload:

```bash
bun run src/index.ts google-flights search \
  --from JFK \
  --to LAX \
  --date 2026-03-20 \
  --return-date 2026-03-27
```

## `google-flights list` (ranked table)

Single request, ranked/filtered rows:

```bash
bun run src/index.ts google-flights list \
  --from JFK \
  --to LAX \
  --date 2026-03-20 \
  --limit 10 \
  --sort-by price
```

## Date Input

`--date` and `--return-date` accept:

- `YYYY-MM-DD` (e.g. `2026-03-25`)
- `M/D` or `M/D/YYYY` (e.g. `3/25`, `4/1/2026`)

If year is omitted and the date has already passed this year, the CLI assumes next year.

## One-Request Preference Example

Your scenario in one command:

```bash
bun run src/index.ts google-flights list \
  --from SFO \
  --to RSW \
  --date 3/25 \
  --return-date 4/1 \
  --prefer-airline united \
  --prefer-nonstop \
  --limit 20 \
  --show-token
```

Strict United + nonstop filtering (single request):

```bash
bun run src/index.ts google-flights list \
  --from SFO \
  --to RSW \
  --date 3/25 \
  --return-date 4/1 \
  --airlines united \
  --stops 0
```

## Shared Options (`google-flights search` + `google-flights list`)

- `--adults <count>`
- `--children <count>`
- `--infants-in-seat <count>`
- `--infants-on-lap <count>`
- `--cabin <economy|premium-economy|business|first>`
- `--currency <code>` (default: `USD`)
- `--hl <lang>` (default: `en`)
- `--gl <country>` (default: `us`)
- `--max-price <amount>`
- `--airlines <codes-or-names>` (csv, e.g. `UA` or `united,delta`)
- `--exclude-airlines <codes-or-names>`
- `--stops <0|1|2|3>`
- `--deep-search`
- `--api-key <key>`

## `google-flights list`-Only Options

- `--limit <count>`
- `--sort-by <price|duration|stops>`
- `--prefer-airline <name-or-code>`
- `--prefer-nonstop`
- `--nonstop-only`
- `--show-token`

## OpenClaw / ClawHub

This repo includes an OpenClaw skill directory for publishing and installation.

- Skill path: `skills/google-search-cli/SKILL.md`
- Ignore file: `skills/google-search-cli/.clawhubignore`

After you’re ready to publish:

```bash
cd /path/to/google-flights-cli
clawhub publish ./skills/google-search-cli --slug google-search-cli --name google-search-cli --version 0.1.0 --changelog "Initial published skill"
```

For local skill usage in an OpenClaw workspace, place this repo (or the `skills` folder) under your workspace and reference `google-search-cli` as a skill.
