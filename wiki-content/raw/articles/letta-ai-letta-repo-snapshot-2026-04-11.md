# Letta Repo Snapshot

Source: https://github.com/letta-ai/letta
Retrieved: 2026-04-11

## Repository metadata
- full_name: letta-ai/letta
- description: Letta is the platform for building stateful agents: AI with advanced memory that can learn and self-improve over time.
- stars: 21,985
- forks: 2,329
- open_issues: 101
- language: Python
- license: Apache-2.0
- created_at: 2023-10-11T07:38:37Z
- updated_at: 2026-04-10T23:13:24Z
- pushed_at: 2026-04-08T00:06:18Z
- default_branch: main

## Recent releases
- v0.16.7 — published 2026-03-31
- v0.16.6 — published 2026-03-04
- v0.16.5 — published 2026-02-24

## Top-level layout highlights
- README.md
- pyproject.toml
- compose.yaml / dev-compose.yaml / docker-compose-vllm.yaml
- `letta/` package
- `tests/`
- `examples/`
- `scripts/`

## README excerpts
- Letta was formerly MemGPT.
- Letta Code runs agents locally in the terminal.
- Letta API is used to build agents into applications.
- The README emphasizes stateful agents, memory blocks, and continual learning.
- SDKs are available for Python and TypeScript/Node.js.

## Codebase shape highlights
- `letta/main.py` routes the default CLI entry into `letta.cli.cli.server`.
- `letta/server/server.py` is the main server entry with agent / block / source / provider / tool orchestration.
- `letta/services/agent_manager.py` contains agent lifecycle and memory-related orchestration.
- `letta/orm/block.py` models core memory blocks.
- `letta/schemas/agent.py` defines agent types and agent state.
- `letta/services/memory_repo/__init__.py` exposes a git-based memory repository backend with local fallback.
