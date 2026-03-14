#!/usr/bin/env node
/**
 * OpenBook MCP Server
 * ===================
 * A Model Context Protocol server for searching and publishing
 * structured community reviews AND real-time Signals in an OpenBook repository.
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
import * as crypto from "crypto";

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

function randomId(length = 10): string {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

// ─── Signal Helpers ───

interface SignalEntry {
  [key: string]: any;
  _body?: string;
  _filename?: string;
}

function parseSignalMd(filepath: string): SignalEntry | null {
  try {
    const content = fs.readFileSync(filepath, "utf-8");
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)/);
    if (!match) return null;

    const meta = yaml.load(match[1]) as Record<string, any>;
    if (!meta || typeof meta !== "object") return null;

    meta._body = match[2].trim();
    meta._filename = path.basename(filepath, ".md");
    return meta;
  } catch {
    return null;
  }
}

function loadSignals(): SignalEntry[] {
  const signalsDir = path.join(REPO, "data", "signals");
  if (!fs.existsSync(signalsDir)) return [];

  const files = fs
    .readdirSync(signalsDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort()
    .reverse(); // newest first

  const signals: SignalEntry[] = [];
  for (const f of files) {
    const sig = parseSignalMd(path.join(signalsDir, f));
    if (sig) signals.push(sig);
  }
  return signals;
}

function signalToMarkdown(data: Record<string, any>): string {
  const bodyContent = data.content || "";
  const targetName = data.target_name || "Unknown";
  const signalType = data.signal_type || "update";

  const typeLabels: Record<string, string> = {
    update: "一般更新",
    price_change: "价格变动",
    closure: "关店",
    new_opening: "新开",
    quality_change: "品质变化",
    warning: "警告",
    recommendation: "推荐",
    event: "活动/事件",
  };
  const typeLabel = typeLabels[signalType] || signalType;

  const fm: Record<string, any> = {
    _schema: "openbook/signal/v1",
    _version: 1,
    _confidence: data._confidence || 0.8,
    _source: data._source || "user_report",
    _verified: false,
    _access: "public",
    target_name: targetName,
    target_category: data.target_category || "general",
    city: data.city || "",
    neighborhood: data.neighborhood || "",
    signal_type: signalType,
    content: bodyContent,
    severity: data.severity || "info",
    date: data.date || todayStr(),
    tags: data.tags || [],
  };

  if (data.district) fm.district = data.district;
  if (data.subcategory) fm.subcategory = data.subcategory;
  if (data.address) fm.address = data.address;
  if (data.price) fm.price = data.price;
  if (data.price_unit) fm.price_unit = data.price_unit;
  if (data.suitable_for) fm.suitable_for = data.suitable_for;

  const yamlStr = yaml.dump(fm, { sortKeys: false });
  const title = `# ${targetName} — ${typeLabel}`;

  return `---\n${yamlStr}---\n${title}\n\n${bodyContent}\n`;
}

// ─── Server Setup ───

const server = new Server(
  { name: "openbook", version: "0.2.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// ─── Tools ───

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // Review tools
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
    // Signal tools
    {
      name: "list_signals",
      description:
        "List recent Signals — real-time, lightweight updates about places and businesses. " +
        "Signals capture time-sensitive changes: price updates, closures, new openings, quality changes. " +
        "Think of them as a 'heartbeat' of a place, while Reviews are 'snapshots'.",
      inputSchema: {
        type: "object" as const,
        properties: {
          city: {
            type: "string",
            description: "Filter by city (e.g., 'Shanghai', 'New York'). Case-insensitive.",
            default: "",
          },
          category: {
            type: "string",
            description: "Filter by target_category (e.g., 'food', 'housing', 'shopping').",
            default: "",
          },
          target: {
            type: "string",
            description: "Filter by target_name (partial match, case-insensitive).",
            default: "",
          },
          signal_type: {
            type: "string",
            description:
              "Filter by type: update, price_change, closure, new_opening, quality_change, warning, recommendation, event.",
            default: "",
          },
          suitable_for: {
            type: "string",
            description:
              "Filter by audience: backpacker, family, kids, pets, couple, solo, business, vegetarian, halal, accessible.",
            default: "",
          },
          limit: {
            type: "number",
            description: "Maximum number of results (default 20).",
            default: 20,
          },
        },
      },
    },
    {
      name: "get_signal",
      description: "Get the full details of a specific Signal by its ID.",
      inputSchema: {
        type: "object" as const,
        properties: {
          signal_id: {
            type: "string",
            description:
              "The Signal ID (filename without .md extension, e.g., '2026-03-14-C9TcSUJR8B')",
          },
        },
        required: ["signal_id"],
      },
    },
    {
      name: "publish_signal",
      description:
        "Publish a new Signal — a real-time, lightweight update about a place. " +
        "Use when the user mentions a time-sensitive observation: 'this place raised prices', " +
        "'new chef is great', 'closed for renovation'. NOT a full review.",
      inputSchema: {
        type: "object" as const,
        properties: {
          target_name: {
            type: "string",
            description: "Name of the place/business (e.g., 'Starbucks Reserve Roastery')",
          },
          content: {
            type: "string",
            description: "The Signal content — what happened or was observed.",
          },
          target_category: {
            type: "string",
            description: "Category: food, housing, shopping, transport, service, general.",
            default: "general",
          },
          city: {
            type: "string",
            description: "City name (e.g., 'Shanghai', 'New York').",
            default: "",
          },
          neighborhood: {
            type: "string",
            description: "Neighborhood or area (e.g., '愚园路', 'East Village').",
            default: "",
          },
          signal_type: {
            type: "string",
            description:
              "Type: update, price_change, closure, new_opening, quality_change, warning, recommendation, event.",
            default: "update",
          },
          severity: {
            type: "string",
            description: "Importance: info, notable, important, critical.",
            default: "info",
          },
          tags: {
            type: "string",
            description: "Comma-separated tags (e.g., 'coffee,cold brew,quiet').",
            default: "",
          },
          suitable_for: {
            type: "string",
            description:
              "Comma-separated audience tags: backpacker, family, kids, pets, couple, solo, business, vegetarian, halal, accessible.",
            default: "",
          },
          district: {
            type: "string",
            description: "Administrative district (e.g., '静安区', '徐汇区').",
            default: "",
          },
          price: {
            type: "number",
            description: "Price amount (0 = not specified).",
            default: 0,
          },
          price_unit: {
            type: "string",
            description: "Currency unit (default: CNY).",
            default: "CNY",
          },
        },
        required: ["target_name", "content"],
      },
    },
    {
      name: "stats",
      description:
        "Get statistics about this OpenBook instance — total reviews per category plus Signal statistics.",
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

    // ─── Signal Tools ───

    case "list_signals": {
      const a = (args || {}) as any;
      const city = a.city || "";
      const category = a.category || "";
      const target = a.target || "";
      const signalType = a.signal_type || "";
      const suitableFor = a.suitable_for || "";
      const limit = a.limit || 20;

      const allSignals = loadSignals();
      const results: SignalEntry[] = [];

      for (const sig of allSignals) {
        if (city && !(sig.city || "").toLowerCase().includes(city.toLowerCase())) continue;
        if (category && (sig.target_category || "").toLowerCase() !== category.toLowerCase()) continue;
        if (target && !(sig.target_name || "").toLowerCase().includes(target.toLowerCase())) continue;
        if (signalType && (sig.signal_type || "").toLowerCase() !== signalType.toLowerCase()) continue;
        if (suitableFor) {
          const sigSuitable = sig.suitable_for || [];
          if (Array.isArray(sigSuitable) && !sigSuitable.map((s: string) => s.toLowerCase()).includes(suitableFor.toLowerCase())) continue;
        }
        results.push(sig);
        if (results.length >= limit) break;
      }

      if (results.length === 0) {
        return { content: [{ type: "text", text: "No Signals found matching your criteria." }] };
      }

      const sevEmoji: Record<string, string> = { info: "ℹ️", notable: "📌", important: "⚠️", critical: "🚨" };
      const typeEmoji: Record<string, string> = {
        update: "🔄", price_change: "💰", closure: "🚫",
        new_opening: "🆕", quality_change: "📊", warning: "⚠️",
        recommendation: "👍", event: "🎉",
      };

      const lines = [`# Signals (${results.length} found)\n`];
      for (const sig of results) {
        const sigName = sig.target_name || "Unknown";
        const sigDate = sig.date || "?";
        const stype = sig.signal_type || "update";
        const severity = sig.severity || "info";
        const cityVal = sig.city || "";
        const neighborhood = sig.neighborhood || "";
        const location = neighborhood ? `${neighborhood}, ${cityVal}` : cityVal;
        const content = sig.content || "";
        const filename = sig._filename || "";

        const te = typeEmoji[stype] || "📝";
        const se = sevEmoji[severity] || "";

        lines.push(`### ${te} ${sigName} ${se}`);
        lines.push(`**Date:** ${sigDate} | **Type:** ${stype} | **Location:** ${location}`);

        if (sig.suitable_for && Array.isArray(sig.suitable_for) && sig.suitable_for.length > 0) {
          lines.push(`**Suitable for:** ${sig.suitable_for.join(", ")}`);
        }
        if (sig.price) {
          const unit = sig.price_unit || "CNY";
          lines.push(`**Price:** ${sig.price} ${unit}`);
        }

        lines.push(`${content}`);
        if (sig.tags && Array.isArray(sig.tags) && sig.tags.length > 0) {
          lines.push(`**Tags:** ${sig.tags.slice(0, 5).join(", ")}`);
        }
        lines.push(`**ID:** ${filename}`);
        lines.push("");
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    case "get_signal": {
      const a = args as any;
      const signalId = a.signal_id as string;
      const filePath = path.join(REPO, "data", "signals", `${signalId}.md`);

      if (!fs.existsSync(filePath)) {
        return { content: [{ type: "text", text: `Signal not found: ${signalId}` }] };
      }

      const sig = parseSignalMd(filePath);
      if (!sig) {
        return { content: [{ type: "text", text: `Error parsing Signal: ${signalId}` }] };
      }

      const lines = [`# Signal: ${sig.target_name || "Unknown"}\n`];
      const skipKeys = new Set(["_body", "_filename"]);
      for (const [key, value] of Object.entries(sig)) {
        if (skipKeys.has(key)) continue;
        const display = Array.isArray(value) ? value.join(", ") : value;
        lines.push(`**${key}:** ${display}`);
      }
      lines.push(`\n---\n${sig._body || ""}`);

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    case "publish_signal": {
      const a = (args || {}) as any;
      const targetName = a.target_name as string;
      const content = a.content as string;

      if (!targetName || !content) {
        return {
          content: [{ type: "text", text: "Error: target_name and content are required." }],
          isError: true,
        };
      }

      const sigData: Record<string, any> = {
        target_name: targetName,
        content: content,
        target_category: a.target_category || "general",
        city: a.city || "",
        neighborhood: a.neighborhood || "",
        signal_type: a.signal_type || "update",
        severity: a.severity || "info",
        date: todayStr(),
        tags: a.tags ? a.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        _confidence: 0.8,
        _source: "user_report",
      };

      if (a.suitable_for) {
        sigData.suitable_for = a.suitable_for.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (a.district) sigData.district = a.district;
      if (a.price && a.price > 0) {
        sigData.price = a.price;
        sigData.price_unit = a.price_unit || "CNY";
      }

      const sigId = `${todayStr()}-${randomId()}`;
      const mdContent = signalToMarkdown(sigData);

      const signalsDir = path.join(REPO, "data", "signals");
      fs.mkdirSync(signalsDir, { recursive: true });
      const filePath = path.join(signalsDir, `${sigId}.md`);
      fs.writeFileSync(filePath, mdContent, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: [
              "Signal published successfully!",
              `- **File:** data/signals/${sigId}.md`,
              `- **Target:** ${targetName}`,
              `- **Type:** ${sigData.signal_type}`,
              `- **City:** ${sigData.city}`,
              "",
              "To share with the community, commit and push:",
              "```",
              `git add data/signals/ && git commit -m 'Signal: ${targetName} (${sigData.signal_type})' && git push`,
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
        lines.push(
          `- ${icon} **${display}** (${sName}): ${reviews.length} reviews`
        );
      }

      // Signal stats
      const signals = loadSignals();
      const signalCount = signals.length;
      total += signalCount;

      const typeCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};
      for (const sig of signals) {
        const stype = sig.signal_type || "update";
        typeCounts[stype] = (typeCounts[stype] || 0) + 1;
        const cityVal = sig.city || "Unknown";
        if (cityVal) cityCounts[cityVal] = (cityCounts[cityVal] || 0) + 1;
      }

      lines.push(`- ⚡ **Signals**: ${signalCount} signals`);
      if (Object.keys(typeCounts).length > 0) {
        const typeStr = Object.entries(typeCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        lines.push(`  - By type: ${typeStr}`);
      }
      if (Object.keys(cityCounts).length > 0) {
        const cityStr = Object.entries(cityCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        lines.push(`  - By city: ${cityStr}`);
      }

      lines.splice(1, 0, `**Total entries:** ${total} (${total - signalCount} reviews + ${signalCount} signals)\n`);
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
    {
      uri: "openbook://signals",
      name: "OpenBook Signals",
      description: "All Signals as a JSON array for programmatic access",
      mimeType: "application/json",
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

  if (uri === "openbook://signals") {
    const signals = loadSignals();
    const clean = signals.map((sig) => {
      const { _body, ...rest } = sig;
      return rest;
    });
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(clean, null, 2),
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
  console.error(`Signals: ${loadSignals().length}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
