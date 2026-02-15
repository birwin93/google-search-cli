---
name: google-flights-cli
description: Search and list flight options from Google Flights (via SerpAPI) from the command line.
metadata: {"openclaw":{"emoji":"✈️","requires":{"bins":["bun"]}}}
---

# Google Flights CLI Skill

Use this skill to run `google-flights-cli` for flight search workflows.

## What it does

- Search Google Flights data from the CLI (`search` action) for raw JSON payloads.
- List ranked options (`list` action) with filters and sorting.
- Supports round-trip searches and strict local filtering (airlines/stops).

## Example Invocations

1. Search flights:

```bash
cd {baseDir}
export SERPAPI_KEY="your_serpapi_key"
bun run src/index.ts google-flights search --from SFO --to RSW --date 3/25 --return-date 4/1
```

2. List ranked non-stop United flights:

```bash
cd {baseDir}
export SERPAPI_KEY="your_serpapi_key"
bun run src/index.ts google-flights list --from SFO --to RSW --date 3/25 --return-date 4/1 --airlines united --stops 0 --sort-by price --limit 10
```

3. Prefer non-stop and one airline when searching:

```bash
cd {baseDir}
export SERPAPI_KEY="your_serpapi_key"
bun run src/index.ts google-flights list --from SFO --to RSW --date 3/25 --return-date 4/1 --prefer-airline united --prefer-nonstop --show-token
```

## Notes

- `SERPAPI_KEY` is required by this skill via environment and can also be passed as `--api-key`.
- Dates accept `YYYY-MM-DD` or `M/D[/YYYY]` forms.
