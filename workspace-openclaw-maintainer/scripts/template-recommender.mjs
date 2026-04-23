#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, "..");
const CURATION_PATH = path.join(WORKSPACE_ROOT, "data", "template-library-curation.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadData() {
  const curation = readJson(CURATION_PATH);
  const indexPath = curation.source.indexPath;
  const source = readJson(indexPath);
  const agents = Array.isArray(source.agents) ? source.agents : [];
  const curated = new Map(
    (curation.recommended || []).map((entry, index) => [
      entry.id,
      { ...entry, curatedRank: index + 1 }
    ])
  );
  return {
    curation,
    agents,
    curated
  };
}

function tokenize(query) {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[\s,，。;；:：/|()（）[\]【】]+/)
        .map((token) => token.trim())
        .filter(Boolean)
    )
  );
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function buildSearchText(agent, curatedEntry) {
  const curatedText = curatedEntry
    ? [
        curatedEntry.title,
        curatedEntry.owner,
        curatedEntry.purpose,
        curatedEntry.why,
        ...(curatedEntry.tags || []),
        ...(curatedEntry.useCases || [])
      ].join(" ")
    : "";
  return normalizeText(
    [
      agent.id,
      agent.name,
      agent.role,
      agent.category,
      agent.path,
      curatedText
    ].join(" ")
  );
}

function scoreAgent(agent, curatedEntry, query) {
  let score = curatedEntry ? curatedEntry.boost || 40 : 0;
  if (!query) return score;
  const normalizedQuery = normalizeText(query);
  const haystack = buildSearchText(agent, curatedEntry);
  if (haystack.includes(normalizedQuery)) score += 24;
  for (const token of tokenize(query)) {
    if (token.length < 2) continue;
    if (haystack.includes(token)) score += 8;
    if (normalizeText(agent.id).includes(token)) score += 4;
    if (normalizeText(agent.category).includes(token)) score += 3;
  }
  return score;
}

function toResult(agent, curatedEntry) {
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    category: agent.category,
    sourcePath: agent.path,
    localSourcePath: path.join(
      WORKSPACE_ROOT,
      "vendor",
      "awesome-openclaw-agents",
      agent.path
    ),
    curated: Boolean(curatedEntry),
    title: curatedEntry?.title || agent.name || agent.id,
    owner: curatedEntry?.owner || null,
    purpose: curatedEntry?.purpose || null,
    why: curatedEntry?.why || null,
    tags: curatedEntry?.tags || [],
    useCases: curatedEntry?.useCases || [],
    playbook: curatedEntry
      ? path.join(WORKSPACE_ROOT, curatedEntry.playbook)
      : null,
    curatedRank: curatedEntry?.curatedRank || null
  };
}

function formatHuman(results, meta) {
  const lines = [];
  lines.push("Template Library");
  lines.push(`Source: ${meta.sourceRepo} (${meta.total} templates)`);
  if (meta.query) lines.push(`Query: ${meta.query}`);
  lines.push("");
  results.forEach((result, index) => {
    lines.push(`${index + 1}. ${result.title} (\`${result.id}\`)`);
    lines.push(`   Category: ${result.category}`);
    if (result.owner) lines.push(`   Owner: ${result.owner}`);
    if (result.purpose) lines.push(`   Purpose: ${result.purpose}`);
    if (result.why) lines.push(`   Why it fits: ${result.why}`);
    if (result.useCases.length > 0) {
      lines.push(`   Best for: ${result.useCases.join(" / ")}`);
    } else if (result.role) {
      lines.push(`   Role: ${result.role}`);
    }
    lines.push(`   Source: ${result.localSourcePath}`);
    if (result.playbook) lines.push(`   Playbook: ${result.playbook}`);
    lines.push("");
  });
  return lines.join("\n").trimEnd();
}

function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift() || "help";
  let top = 4;
  let json = false;
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--top") {
      top = Number.parseInt(args[i + 1] || "4", 10);
      i += 1;
      continue;
    }
    positional.push(arg);
  }
  return {
    command,
    top: Number.isFinite(top) && top > 0 ? top : 4,
    json,
    positional
  };
}

function printHelp() {
  console.log(`Usage:
  node scripts/template-recommender.mjs list [--top N] [--json]
  node scripts/template-recommender.mjs shortlist [--top N] [--json]
  node scripts/template-recommender.mjs query "<text>" [--top N] [--json]
  node scripts/template-recommender.mjs show <id> [--json]`);
}

function main() {
  const { command, top, json, positional } = parseArgs(process.argv.slice(2));
  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  const { curation, agents, curated } = loadData();
  const meta = {
    sourceRepo: curation.source.repo,
    total: agents.length
  };

  if (command === "list" || command === "shortlist") {
    const results = agents
      .filter((agent) => curated.has(agent.id))
      .map((agent) => ({
        score: scoreAgent(agent, curated.get(agent.id), ""),
        result: toResult(agent, curated.get(agent.id))
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.result.curatedRank || 999) - (b.result.curatedRank || 999);
      })
      .slice(0, top)
      .map((entry) => entry.result);

    if (json) {
      console.log(JSON.stringify({ meta, results }, null, 2));
      return;
    }
    console.log(formatHuman(results, meta));
    return;
  }

  if (command === "query") {
    const query = positional.join(" ").trim();
    if (!query) {
      console.error("Missing query text.");
      process.exitCode = 1;
      return;
    }
    const results = agents
      .map((agent) => {
        const curatedEntry = curated.get(agent.id);
        return {
          score: scoreAgent(agent, curatedEntry, query),
          result: toResult(agent, curatedEntry)
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.result.curated !== b.result.curated) return a.result.curated ? -1 : 1;
        return a.result.id.localeCompare(b.result.id);
      })
      .slice(0, top)
      .map((entry) => entry.result);

    if (json) {
      console.log(JSON.stringify({ meta: { ...meta, query }, results }, null, 2));
      return;
    }
    console.log(formatHuman(results, { ...meta, query }));
    return;
  }

  if (command === "show") {
    const id = (positional[0] || "").trim();
    if (!id) {
      console.error("Missing template id.");
      process.exitCode = 1;
      return;
    }
    const agent = agents.find((entry) => entry.id === id);
    if (!agent) {
      console.error(`Unknown template id: ${id}`);
      process.exitCode = 1;
      return;
    }
    const result = toResult(agent, curated.get(agent.id));
    if (json) {
      console.log(JSON.stringify({ meta, result }, null, 2));
      return;
    }
    console.log(formatHuman([result], meta));
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exitCode = 1;
}

main();
