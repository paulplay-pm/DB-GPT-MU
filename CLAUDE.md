# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DB-GPT is an open-source AI data assistant that connects to databases, writes SQL and code autonomously, runs skills in sandboxed environments, and turns analysis into reports and insights. It supports multi-source data access, agentic workflows (AWEL), RAG pipelines, and skill-driven extensibility.

## Package Architecture

DB-GPT uses a **layered monorepo** under `packages/`:

| Package | Purpose |
|---------|---------|
| `dbgpt-core/` | Core abstractions, interfaces (LLM, Storage, Message, Embedding), AWEL workflow engine, Agent system |
| `dbgpt-serve/` | REST API service layer — exposes all core functionality as endpoints |
| `dbgpt-app/` | Main application server (FastAPI) that orchestrates all packages |
| `dbgpt-client/` | Python SDK for external applications to interact with DB-GPT services |
| `dbgpt-ext/` | Concrete implementations: RAG operators, data source connectors (MySQL, PostgreSQL, DuckDB, etc.), embedding providers |
| `dbgpt-sandbox/` | Sandboxed code execution environment |
| `dbgpt-accelerator/` | Performance acceleration (auto-detection, flash attention) |

### Key Architectural Patterns

- **AWEL (Agentic Workflow Expression Language)**: Declarative DAG-based workflow orchestration in `dbgpt-core/src/dbgpt/core/awel/`. Defines operators, triggers, and flow runners.
- **Agent System**: Agent-based task planning and execution in `dbgpt-core/src/dbgpt/agent/`. Supports skills, tool use, and team collaboration.
- **Component System**: `SystemApp` provides dependency injection and lifecycle management across all packages.
- **Service Layer**: `dbgpt-serve/` follows a service-oriented architecture with standardized REST endpoints.

## Development Commands

### Python Backend

```bash
# Install dependencies (creates .venv.make)
make setup

# Run unit tests
make test

# Run a single test
pytest --pyargs dbgpt.path.to.test

# Format Python code (ruff)
make fmt

# Check formatting without changes
make fmt-check

# Type check (mypy on dbgpt-core only)
make mypy

# Run pre-commit (format + tests + mypy)
make pre-commit

# Run tests with coverage
make coverage

# Build packages for distribution
make build

# Publish to PyPI
make publish
```

### Web UI (Next.js)

```bash
cd web
npm run dev    # Development server
npm run build  # Production build
```

## Technology Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic v2, asyncio
- **Agent Framework**: Custom agent system with AWEL workflow engine
- **RAG**: ChromaDB, embedding models, knowledge chunking
- **Data Sources**: MySQL, PostgreSQL, DuckDB, SQLite, ClickHouse, OceanBase, StarRocks, etc.
- **LLM Providers**: OpenAI, Anthropic, Ollama, Qianfan, Tongyi, ZhipuAI, Local models (llama.cpp)
- **Web UI**: Next.js 13, React 18, Ant Design 5, TypeScript

## Project Structure

```
packages/
├── dbgpt-core/src/dbgpt/
│   ├── agent/          # Agent system (core/, expand/)
│   ├── core/          # Core modules (awel/, interface/, operators/, schema/)
│   ├── datasource/    # Database connections
│   ├── rag/           # RAG pipelines
│   └── util/          # Utilities
├── dbgpt-serve/src/dbgpt_serve/
│   ├── agent/         # Agent management endpoints
│   ├── conversation/  # Chat/conversation APIs
│   ├── datasource/    # Data source APIs
│   ├── flow/          # AWEL workflow APIs
│   ├── model/         # Model serving APIs
│   └── rag/           # RAG service APIs
└── dbgpt-app/src/dbgpt_app/
    ├── dbgpt_server.py  # Main FastAPI app entry point
    └── static/web/       # Built web UI assets

web/                    # Next.js frontend (separate build)
skills/                 # Reusable skills (CSV analysis, report generation, etc.)
pilot/                  # Runtime data (ChromaDB, examples, migrations)
configs/                # Configuration profiles
```

## Code Style

- **Formatter**: ruff with 88-character line length
- **Linting**: ruff (E, F, I rules)
- **Type Checking**: mypy on `dbgpt-core/` (partially implemented)
- **Docstrings**: Google style with double quotes
- **Import Order**: isort with known first-party modules: `dbgpt, dbgpt_acc_auto, dbgpt_client, dbgpt_ext, dbgpt_serve, dbgpt_app, dbgpt_sandbox`

## Testing

- **Framework**: pytest with `pytest-asyncio`
- **Path**: Tests live alongside source in `tests/` directories
- **Config**: `pytest.ini_options` in root `pyproject.toml` sets `pythonpath = ["packages"]` and `--import-mode=importlib`

## Running the Application

```bash
# Start the web server (after installation)
dbgpt start webserver --profile <profile>

# Or via uv
uv run dbgpt start webserver --profile <profile>
```

The server runs on `http://localhost:5670` by default.
