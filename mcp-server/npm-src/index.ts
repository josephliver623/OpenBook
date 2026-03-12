#!/usr/bin/env node
/**
 * OpenBook MCP Server
 * ===================
 * A Model Context Protocol server for searching and publishing
 * structured community reviews in an OpenBook repository.
 *
 * Usage:
 *   npx openbook-mcp                         # auto-detect repo in cwd
 *   npx openbook-mcp /path/to/openbook       # specify repo path
 *   OPENBOOK_REPO=/path npx openbook-mcp     # via env var
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

// ─── Repo Discovery ───

function findRepo(): string {
  // 1. CLI argument
  const arg = process.argv[2];
  if (arg && fs.existsSync(arg) && fs.statSync(arg).isDirectory()) {
    return path.resolve(arg);
  }
  // 2. Environment variable
  const envPath = process.env.OPENBOOK_REPO;
  if (envPath && fs.existsSync(envPath)) {
    return path.resolve(envPath);
  }
  // 3. Walk up from cwd
  let p = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (
      fs.existsSync(path.join(p, "schemas")) &&
      fs.existsSync(path.join(p, "SKILL.md"))
    ) {
      return p;
    }
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  // 4. Default to cwd
  return process.cwd();
}

const REPO = findRepo();

// ─── Helpers ───

interface SchemaField {
  type: string;
  required?: boolean;
  agent_prompt?: string;
  min?: number;
  max?: number;
  enum?: string[];
  labels?: string[];
  unit?: string;
  default?: any;
  auto?: string;
}

interface Schema {
  name: string;
  display_name?: string;
  description?: string;
  icon?: string;
  fields: Record<string, SchemaField>;
}

function loadSchemas(): Record<string, Schema> {
  const schemas: Record<string, Schema> = {};
  const schemaDir = path.join(REPO, "schemas");
  if (!fs.existsSync(schemaDir)) return schemas;

  const files = fs.readdirSync(schemaDir).filter((f) => f.endsWith(".yml"));
  for (const f of files) {
    const content = fs.readFileSync(path.join(schemaDir, f), "utf-8");
    const schema = yaml.load(content) as Schema;
    if (schema && schema.name) {
      schemas[schema.name] = schema;
    }
  }
  return schemas;
}

function loadIndex(): any[] {
  const idxPath = path.join(REPO, "_index.json");
  if (fs.existsSync(idxPath)) {
    return JSON.parse(fs.readFileSync(idxPath, "utf-8"));
  }
  return [];
}

function loadReviews(category: string): any[] {
  const dataDir = path.join(REPO, "data", category);
  if (!fs.existsSync(dataDir)) return [];

  const files = fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith(".json"))
    .sort();
  const reviews: any[] = [];
  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(dataDir, f), "utf-8");
      reviews.push(JSON.parse(content));
    } catch {
      continue;
    }
  }
  return reviews;
}

function slugify(text: string, maxLen = 40): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLen);
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function todayCompact(): string {
  return todayStr().replace(/-/g, "");
}

// ─── Server Setup ───

const server = new Server(
  { name: "openbook", version: "0.1.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// ─── Tools ───

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_categories",
      description:
        "List all available review categories in this OpenBook instance with their display names, descriptions, and fields.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "get_schema",
      description:
        "Get the full schema definition for a review category, including all field types, constraints, and agent prompts.",
      inputSchema: {
        type: "object" as const,
        properties: {
          category: {
            type: "string",
            description: "Category name (e.g., 'housing', 'food', 'jobs')",
          },
        },
        required: ["category"],
      },
    },
    {
      name: "search_reviews",
      description:
        "Search reviews across all categories or within a specific category. Supports filtering by rating, price, city, and keywords.",
      inputSchema: {
        type: "object" as const,
        properties: {
          category: {
            type: "string",
            description:
              "Filter by category (e.g., 'housing', 'food', 'jobs'). Empty = all.",
            default: "",
          },
          query: {
            type: "string",
            description: "Free-text keyword search across all fields.",
            default: "",
          },
          min_rating: {
            type: "number",
            description: "Minimum overall_rating filter (1-5). 0 = no filter.",
            default: 0,
          },
          max_price: {
            type: "number",
            description:
              "Maximum price filter (rent_monthly or price_per_person). 0 = no filter.",
            default: 0,
          },
          city: {
            type: "string",
            description: "Filter by city name (case-insensitive partial match).",
            default: "",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return.",
            default: 10,
          },
        },
      },
    },
    {
      name: "get_review",
      description: "Get the full details of a specific review by its ID.",
      inputSchema: {
        type: "object" as const,
        properties: {
          category: {
            type: "string",
            description: "The review category (e.g., 'housing', 'food', 'jobs')",
          },
          review_id: {
            type: "string",
            description: "The review ID (filename without .json extension)",
          },
        },
        required: ["category", "review_id"],
      },
    },
    {
      name: "publish_review",
      description:
        "Publish a new review. First call get_schema() to understand required fields, collect all data from the user, then submit.",
      inputSchema: {
        type: "object" as const,
        properties: {
          category: {
            type: "string",
            description: "The review category (e.g., 'housing', 'food', 'jobs')",
          },
          data: {
            type: "object",
            description:
              "Review data object with all required fields from the schema. Do NOT include meta fields (_schema, _version, _id).",
          },
        },
        required: ["category", "data"],
      },
    },
    {
      name: "stats",
      description:
        "Get statistics about this OpenBook instance — total reviews per category.",
      inputSchema: { type: "object" as const, properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_categories": {
      const schemas = loadSchemas();
      if (Object.keys(schemas).length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No categories found. Make sure the schemas/ directory exists.",
            },
          ],
        };
      }
      const lines = ["# Available Categories\n"];
      for (const [sName, schema] of Object.entries(schemas)) {
        const display = schema.display_name || sName;
        const desc = schema.description || "";
        const icon = schema.icon || "";
        const fields = schema.fields || {};
        const required = Object.entries(fields)
          .filter(([, v]) => v.required)
          .map(([k]) => k);
        const optional = Object.entries(fields)
          .filter(([, v]) => !v.required)
          .map(([k]) => k);
        lines.push(`## ${icon} ${display} (\`${sName}\`)`);
        lines.push(`${desc}\n`);
        lines.push(`- Required fields: ${required.join(", ")}`);
        lines.push(`- Optional fields: ${optional.join(", ")}`);
        lines.push("");
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    case "get_schema": {
      const category = (args as any)?.category as string;
      const schemas = loadSchemas();
      if (!schemas[category]) {
        return {
          content: [
            {
              type: "text",
              text: `Category '${category}' not found. Available: ${Object.keys(schemas).join(", ")}`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: yaml.dump(schemas[category], { sortKeys: false }),
          },
        ],
      };
    }

    case "search_reviews": {
      const a = (args || {}) as any;
      const category = a.category || "";
      const query = a.query || "";
      const minRating = a.min_rating || 0;
      const maxPrice = a.max_price || 0;
      const city = a.city || "";
      const limit = a.limit || 10;

      let index = loadIndex();
      if (index.length === 0) {
        const schemas = loadSchemas();
        for (const catName of Object.keys(schemas)) {
          index.push(...loadReviews(catName));
        }
      }

      const results: any[] = [];
      for (const item of index) {
        if (category && item._schema !== category) continue;
        if (minRating > 0 && (item.overall_rating || 0) < minRating) continue;
        if (maxPrice > 0) {
          const price = item.rent_monthly || item.price_per_person || 0;
          if (price > maxPrice) continue;
        }
        if (city && !(item.city || "").toLowerCase().includes(city.toLowerCase()))
          continue;
        if (query) {
          const text = JSON.stringify(item).toLowerCase();
          if (!text.includes(query.toLowerCase())) continue;
        }
        results.push(item);
        if (results.length >= limit) break;
      }

      if (results.length === 0) {
        return {
          content: [
            { type: "text", text: "No reviews found matching your criteria." },
          ],
        };
      }

      const lines = [`# Search Results (${results.length} found)\n`];
      for (const r of results) {
        const schema = r._schema || "unknown";
        const title = r.title || "Untitled";
        const rating = r.overall_rating || 0;
        const cityVal = r.city || "";
        const neighborhood = r.neighborhood || "";
        const location = neighborhood ? `${neighborhood}, ${cityVal}` : cityVal;

        lines.push(`### ${title}`);
        lines.push(
          `**Category:** ${schema} | **Rating:** ${"★".repeat(Math.floor(rating))}${"☆".repeat(5 - Math.floor(rating))} (${rating}/5) | **Location:** ${location}`
        );

        if (schema === "housing") {
          lines.push(
            `**Rent:** $${r.rent_monthly || "?"}/mo | **Noise:** ${r.noise_level || "?"}/5 | **Renovation:** ${r.renovation || "?"}`
          );
        } else if (schema === "food") {
          lines.push(
            `**Cuisine:** ${r.cuisine || "?"} | **Price:** $${r.price_per_person || "?"}/person | **Taste:** ${r.taste_rating || "?"}/5`
          );
        } else if (schema === "jobs") {
          lines.push(
            `**Company:** ${r.company || "?"} | **Position:** ${r.position || "?"} | **Result:** ${r.result || "?"}`
          );
        }

        const pros = r.pros || [];
        const cons = r.cons || [];
        if (pros.length) lines.push(`**Pros:** ${pros.slice(0, 3).join(", ")}`);
        if (cons.length) lines.push(`**Cons:** ${cons.slice(0, 3).join(", ")}`);
        lines.push("");
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    case "get_review": {
      const a = args as any;
      const filePath = path.join(
        REPO,
        "data",
        a.category,
        `${a.review_id}.json`
      );
      if (!fs.existsSync(filePath)) {
        return {
          content: [
            {
              type: "text",
              text: `Review not found: ${a.category}/${a.review_id}`,
            },
          ],
        };
      }
      const review = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const lines = [`# ${review.title || "Untitled"}\n`];
      for (const [key, value] of Object.entries(review)) {
        if (key.startsWith("_")) continue;
        const display = Array.isArray(value) ? (value as any[]).join(", ") : value;
        lines.push(`**${key}:** ${display}`);
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    case "publish_review": {
      const a = args as any;
      const category = a.category as string;
      const data = a.data as Record<string, any>;

      const schemas = loadSchemas();
      if (!schemas[category]) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Category '${category}' not found. Available: ${Object.keys(schemas).join(", ")}`,
            },
          ],
        };
      }

      const schema = schemas[category];
      const fields = schema.fields || {};

      // Validate required fields
      const missing: string[] = [];
      for (const [fieldName, fieldDef] of Object.entries(fields)) {
        if (fieldDef.required && !(fieldName in data)) {
          if (fieldDef.auto === "today" && fieldName === "date") {
            data.date = todayStr();
          } else if (fieldDef.default !== undefined) {
            data[fieldName] = fieldDef.default;
          } else {
            missing.push(fieldName);
          }
        }
      }

      if (missing.length > 0) {
        const prompts = missing.map((m) => {
          const prompt = fields[m]?.agent_prompt || `Please provide ${m}`;
          return `- **${m}**: ${prompt}`;
        });
        return {
          content: [
            {
              type: "text",
              text: `Error: Missing required fields:\n${prompts.join("\n")}`,
            },
          ],
        };
      }

      // Auto-fill date
      if (!data.date) data.date = todayStr();

      // Generate ID
      const titleSlug = slugify(data.title || category);
      const reviewId = `${todayCompact()}-${titleSlug}`;

      // Add meta
      data._schema = category;
      data._version = 1;
      data._id = reviewId;

      // Save
      const dataDir = path.join(REPO, "data", category);
      fs.mkdirSync(dataDir, { recursive: true });
      const filePath = path.join(dataDir, `${reviewId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

      return {
        content: [
          {
            type: "text",
            text: [
              "Review published successfully!",
              `- **File:** data/${category}/${reviewId}.json`,
              `- **Title:** ${data.title || "N/A"}`,
              `- **Rating:** ${data.overall_rating || "N/A"}/5`,
              "",
              "To share with the community, commit and push:",
              "```",
              `git add data/ && git commit -m 'Add ${category} review: ${data.title || reviewId}' && git push`,
              "```",
            ].join("\n"),
          },
        ],
      };
    }

    case "stats": {
      const schemas = loadSchemas();
      const lines = ["# OpenBook Statistics\n"];
      let total = 0;
      for (const [sName, schema] of Object.entries(schemas)) {
        const reviews = loadReviews(sName);
        total += reviews.length;
        const display = schema.display_name || sName;
        const icon = schema.icon || "";
        lines.push(`- ${icon} **${display}** (${sName}): ${reviews.length} reviews`);
      }
      lines.splice(1, 0, `**Total reviews:** ${total}\n`);
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

// ─── Resources ───

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "openbook://index",
      name: "OpenBook Index",
      description: "The full review index for fast searching",
      mimeType: "application/json",
    },
    {
      uri: "openbook://schemas",
      name: "OpenBook Schemas",
      description: "All category schemas in one document",
      mimeType: "text/yaml",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "openbook://index") {
    const index = loadIndex();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(index, null, 2),
        },
      ],
    };
  }

  if (uri === "openbook://schemas") {
    const schemas = loadSchemas();
    return {
      contents: [
        {
          uri,
          mimeType: "text/yaml",
          text: yaml.dump(schemas, { sortKeys: false }),
        },
      ],
    };
  }

  return { contents: [] };
});

// ─── Start ───

async function main() {
  console.error("OpenBook MCP Server starting...");
  console.error(`Repository: ${REPO}`);
  console.error(`Schemas: ${Object.keys(loadSchemas()).join(", ")}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
