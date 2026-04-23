#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    input: "/home/rui/.openclaw/openclaw.json",
    output: "",
    stdout: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (part === "--in" && argv[i + 1]) {
      args.input = argv[i + 1];
      i += 1;
      continue;
    }
    if (part === "--out" && argv[i + 1]) {
      args.output = argv[i + 1];
      i += 1;
      continue;
    }
    if (part === "--stdout") {
      args.stdout = true;
    }
  }
  return args;
}

function isNumericTelegramId(value) {
  return typeof value === "string" && /^-?\d{5,}$/.test(value);
}

function sanitizeScalar(key, value) {
  if (typeof value !== "string") {
    if (key === "lastTouchedAt" || key === "lastRunAt") return "__REDACTED_TIMESTAMP__";
    return value;
  }
  if (key === "token") {
    if (value.startsWith("ghp_") || value.startsWith("ghu_")) return "__SET_GITHUB_TOKEN__";
    return "__REDACTED_TOKEN__";
  }
  if (key === "apiKey") {
    if (value === "ollama-local") return "ollama-local";
    return "__SET_API_KEY__";
  }
  if (key === "botToken") return "__SET_TELEGRAM_BOT_TOKEN__";
  if (key === "tokenFile") {
    return `/home/rui/.openclaw/secrets/${path.basename(value)}`;
  }
  if (key === "lastTouchedAt" || key === "lastRunAt") return "__REDACTED_TIMESTAMP__";
  return value;
}

function sanitizeArray(key, value) {
  if (key === "allowFrom" || key === "groupAllowFrom") {
    return value.map((item) => {
      if (item === "*") return item;
      return isNumericTelegramId(item) ? "__YOUR_TELEGRAM_USER_ID__" : item;
    });
  }
  if (key === "approvers") {
    return value.map((item) => (isNumericTelegramId(item) ? "__YOUR_TELEGRAM_APPROVER_ID__" : item));
  }
  return value.map((item) => sanitizeValue(item, []));
}

function sanitizeObjectEntries(entries, pathStack) {
  const joined = pathStack.join(".");
  if (/^channels\.telegram\.accounts\.[^.]+\.groups$/.test(joined)) {
    let index = 1;
    const out = {};
    for (const [, value] of entries) {
      const placeholder = `__YOUR_TELEGRAM_GROUP_ID_${index}__`;
      out[placeholder] = sanitizeValue(value, [...pathStack, placeholder]);
      index += 1;
    }
    return out;
  }
  const out = {};
  for (const [key, value] of entries) {
    out[key] = sanitizeValue(value, [...pathStack, key]);
  }
  return out;
}

function sanitizeValue(value, pathStack) {
  if (Array.isArray(value)) {
    return sanitizeArray(pathStack[pathStack.length - 1] ?? "", value);
  }
  if (value && typeof value === "object") {
    return sanitizeObjectEntries(Object.entries(value), pathStack);
  }
  return sanitizeScalar(pathStack[pathStack.length - 1] ?? "", value);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = JSON.parse(readFileSync(args.input, "utf8"));
  const sanitized = sanitizeValue(input, []);
  const output = `${JSON.stringify(sanitized, null, 2)}\n`;

  if (args.stdout || !args.output) {
    process.stdout.write(output);
  }
  if (args.output) {
    writeFileSync(args.output, output, "utf8");
  }
}

main();
