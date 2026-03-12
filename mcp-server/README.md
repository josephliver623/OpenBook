# OpenBook MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server that lets any MCP-compatible AI client (Claude Desktop, Cursor, etc.) search and publish structured reviews in an OpenBook repository.

## Quick Start

### 1. Install dependencies

```bash
pip install "mcp[cli]" pyyaml
```

### 2. Run the server

```bash
# From the OpenBook repo root
cd /path/to/your/OpenBook
python mcp-server/openbook_mcp.py

# Or specify the repo path
python mcp-server/openbook_mcp.py /path/to/OpenBook

# Or via environment variable
OPENBOOK_REPO=/path/to/OpenBook python mcp-server/openbook_mcp.py
```

### 3. Configure your MCP client

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "openbook": {
      "command": "python",
      "args": ["/path/to/OpenBook/mcp-server/openbook_mcp.py", "/path/to/OpenBook"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "openbook": {
      "command": "python",
      "args": ["/path/to/OpenBook/mcp-server/openbook_mcp.py", "/path/to/OpenBook"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|---|---|
| `list_categories` | List all available review categories and their fields |
| `get_schema` | Get the full YAML schema for a specific category |
| `search_reviews` | Search reviews with filters (category, rating, price, city, keywords) |
| `get_review` | Get full details of a specific review |
| `publish_review` | Publish a new review (validates against schema) |
| `stats` | Get review count statistics |

## Available Resources

| Resource | Description |
|---|---|
| `openbook://index` | Full review index for fast searching |
| `openbook://schemas` | All category schemas in one document |

## Example Conversations

**Search:**
> "Find me quiet apartments in New York under $3000"

The agent will call `search_reviews(category="housing", city="New York", max_price=3000)` and present results.

**Publish:**
> "I want to review a restaurant I went to"

The agent will call `get_schema("food")`, then ask you each required field based on the `agent_prompt`, validate your answers, and call `publish_review()`.
