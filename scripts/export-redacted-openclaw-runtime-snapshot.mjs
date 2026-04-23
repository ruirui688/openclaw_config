#!/usr/bin/env node

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    output: "/home/rui/.openclaw/artifacts/runtime-snapshots/latest.md",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (part === "--out" && argv[i + 1]) {
      args.output = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function sanitize(text) {
  return String(text)
    .replace(/\b\d{8,12}:[A-Za-z0-9_-]+\b/g, "__REDACTED_TELEGRAM_BOT_TOKEN__")
    .replace(/\bsk-[A-Za-z0-9._-]+\b/g, "__REDACTED_OPENAI_KEY__")
    .replace(/\bgh[pousr]_[A-Za-z0-9_]+\b/g, "__REDACTED_GITHUB_TOKEN__")
    .replace(/("?(?:apiKey|token|botToken)"?\s*[:=]\s*"?)([^"\n ]+)/gi, "$1__REDACTED_SECRET__")
    .replace(/\b-100\d{6,}\b/g, "__REDACTED_TELEGRAM_GROUP_ID__")
    .replace(/\b\d{7,}\b/g, "__REDACTED_NUMERIC_ID__")
    .replace(/\b(?!127\.0\.0\.1)(?:\d{1,3}\.){3}\d{1,3}\b/g, "__REDACTED_IP__");
}

function runCommand(command) {
  try {
    const stdout = execSync(command, {
      encoding: "utf8",
      shell: "/bin/bash",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return {
      ok: true,
      output: sanitize(stdout).trim() || "(no output)",
    };
  } catch (error) {
    const stdout = error.stdout ? String(error.stdout) : "";
    const stderr = error.stderr ? String(error.stderr) : "";
    const merged = [stdout, stderr].filter(Boolean).join("\n").trim();
    return {
      ok: false,
      output: sanitize(merged || error.message || "command failed"),
    };
  }
}

function renderSection(title, command, result) {
  return [
    `## ${title}`,
    "",
    `Command: \`${command}\``,
    "",
    `Result: ${result.ok ? "ok" : "error"}`,
    "",
    "```text",
    result.output,
    "```",
    "",
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const sections = [
    ["Config Validate", "openclaw config validate"],
    ["Gateway Health", "openclaw health"],
    ["Telegram Channel Probe", "openclaw channels status --probe"],
    ["Gateway Service", "systemctl --user status openclaw-gateway --no-pager | head -40"],
    ["Repo Status", "git -C /home/rui/.openclaw status -sb"],
  ];
  const body = [];
  body.push("# OpenClaw Redacted Runtime Snapshot");
  body.push("");
  body.push(`Generated at: ${new Date().toISOString()}`);
  body.push("");
  body.push("This file is intended for version control. Secrets and high-risk identifiers are redacted.");
  body.push("");
  for (const [title, command] of sections) {
    body.push(renderSection(title, command, runCommand(command)));
  }
  mkdirSync(path.dirname(args.output), { recursive: true });
  writeFileSync(args.output, `${body.join("\n")}\n`, "utf8");
}

main();
