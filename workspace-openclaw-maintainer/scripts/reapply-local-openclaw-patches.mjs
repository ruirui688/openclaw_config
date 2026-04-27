#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const DEFAULT_RUNTIME_FILE =
  "/home/rui/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/dist/openclaw-tools-CUmYpN1l.js";
const DEFAULT_TELEGRAM_BOT_FILE =
  "/home/rui/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/dist/extensions/telegram/bot-Ch7__EHu.js";
const DEFAULT_TELEGRAM_DELIVERY_FILE =
  "/home/rui/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/dist/extensions/telegram/delivery-AYrG1NE_.js";
const DEFAULT_BOOT_HANDLER_FILE =
  "/home/rui/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/dist/bundled/boot-md/handler.js";

const runtimeFile = process.env.OPENCLAW_TOOLS_RUNTIME_FILE || DEFAULT_RUNTIME_FILE;
const telegramBotFile = process.env.OPENCLAW_TELEGRAM_BOT_FILE || DEFAULT_TELEGRAM_BOT_FILE;
const telegramDeliveryFile =
  process.env.OPENCLAW_TELEGRAM_DELIVERY_FILE || DEFAULT_TELEGRAM_DELIVERY_FILE;
const bootHandlerFile = process.env.OPENCLAW_BOOT_HANDLER_FILE || DEFAULT_BOOT_HANDLER_FILE;

const strictParamBlock = `\t\t\tconst streamTo = params.streamTo === "parent" ? "parent" : void 0;
\t\t\tconst lightContext = params.lightContext === true;
\t\t\tif (runtime === "acp" && lightContext) throw new Error("lightContext is only supported for runtime='subagent'.");
\t\t\tconst timeoutSecondsCandidate = typeof params.runTimeoutSeconds === "number" ? params.runTimeoutSeconds : typeof params.timeoutSeconds === "number" ? params.timeoutSeconds : void 0;
\t\t\tconst runTimeoutSeconds = typeof timeoutSecondsCandidate === "number" && Number.isFinite(timeoutSecondsCandidate) ? Math.max(0, Math.floor(timeoutSecondsCandidate)) : void 0;
\t\t\tconst thread = params.thread === true;
\t\t\tconst attachments = Array.isArray(params.attachments) ? params.attachments : void 0;
\t\t\tif (streamTo && runtime !== "acp") return jsonResult({
\t\t\t\tstatus: "error",
\t\t\t\terror: \`streamTo is only supported for runtime=acp; got runtime=\${runtime}\`
\t\t\t});
\t\t\tif (resumeSessionId && runtime !== "acp") return jsonResult({
\t\t\t\tstatus: "error",
\t\t\t\terror: \`resumeSessionId is only supported for runtime=acp; got runtime=\${runtime}\`
\t\t\t});`;

const tolerantParamBlock = `\t\t\tconst requestedStreamTo = params.streamTo === "parent" ? "parent" : void 0;
\t\t\tconst lightContext = params.lightContext === true;
\t\t\tif (runtime === "acp" && lightContext) throw new Error("lightContext is only supported for runtime='subagent'.");
\t\t\tconst timeoutSecondsCandidate = typeof params.runTimeoutSeconds === "number" ? params.runTimeoutSeconds : typeof params.timeoutSeconds === "number" ? params.timeoutSeconds : void 0;
\t\t\tconst runTimeoutSeconds = typeof timeoutSecondsCandidate === "number" && Number.isFinite(timeoutSecondsCandidate) ? Math.max(0, Math.floor(timeoutSecondsCandidate)) : void 0;
\t\t\tconst thread = params.thread === true;
\t\t\tconst attachments = Array.isArray(params.attachments) ? params.attachments : void 0;
\t\t\tconst streamTo = runtime === "acp" ? requestedStreamTo : void 0;
\t\t\tconst effectiveResumeSessionId = runtime === "acp" ? resumeSessionId : void 0;`;

const strictResumeBlock = `\t\t\t\t\tagentId: requestedAgentId,
\t\t\t\t\tresumeSessionId,
\t\t\t\t\tcwd,`;

const tolerantResumeBlock = `\t\t\t\t\tagentId: requestedAgentId,
\t\t\t\t\tresumeSessionId: effectiveResumeSessionId,
\t\t\t\t\tcwd,`;

const telegramBotHelperAnchor = `const TELEGRAM_MIN_COMMAND_DESCRIPTION_LENGTH = 1;`;
const telegramBotHelperBlock = `${telegramBotHelperAnchor}
function resolveTelegramBotMediaLocalRoots(cfg, route) {
\tconst agentRoots = getAgentScopedMediaLocalRoots(cfg, route.agentId);
\tconst accountRoots = (resolveTelegramAccount({
\t\tcfg,
\t\taccountId: route.accountId
\t}).config.mediaLocalRoots ?? []).map((entry) => path.resolve(entry));
\treturn Array.from(new Set([...agentRoots, ...accountRoots]));
}`;
const telegramBotCommandRootsOriginal =
  `mediaLocalRoots: nativeCommandRuntime.getAgentScopedMediaLocalRoots(runtimeCfg, route.agentId),`;
const telegramBotCommandRootsPatched =
  `mediaLocalRoots: resolveTelegramBotMediaLocalRoots(runtimeCfg, route),`;
const telegramBotReplyRootsOriginal =
  `const mediaLocalRoots = getAgentScopedMediaLocalRoots(cfg, route.agentId);`;
const telegramBotReplyRootsPatched =
  `const mediaLocalRoots = resolveTelegramBotMediaLocalRoots(cfg, route);`;

const telegramDeliveryImportAnchor =
  `import { getGlobalHookRunner } from "openclaw/plugin-sdk/plugin-runtime";`;
const telegramDeliveryImportPatched = `${telegramDeliveryImportAnchor}
import { fileURLToPath } from "node:url";`;
const telegramDeliveryHelperAnchor =
  `const GrammyErrorCtor$2 = typeof GrammyError === "function" ? GrammyError : void 0;`;
const telegramDeliveryHelperBlock = `${telegramDeliveryHelperAnchor}
function resolveDynamicReplyMediaLocalRoots(mediaLocalRoots, mediaList) {
\tconst roots = Array.from(new Set((mediaLocalRoots ?? []).map((root) => path.resolve(root))));
\tfor (const source of mediaList ?? []) {
\t\tconst trimmed = typeof source === "string" ? source.trim() : "";
\t\tif (!trimmed || /^https?:\\/\\//i.test(trimmed) || /^data:/i.test(trimmed)) continue;
\t\tlet localPath = trimmed;
\t\tif (trimmed.startsWith("file://")) try {
\t\t\tlocalPath = fileURLToPath(trimmed);
\t\t} catch {
\t\t\tcontinue;
\t\t}
\t\telse if (trimmed.startsWith("~")) localPath = path.join(process.env.HOME ?? "~", trimmed.slice(1));
\t\tif (!path.isAbsolute(localPath)) continue;
\t\tconst parentDir = path.dirname(path.resolve(localPath));
\t\tif (parentDir === path.parse(parentDir).root || roots.includes(parentDir)) continue;
\t\troots.push(parentDir);
\t}
\treturn roots;
}`;
const telegramDeliveryRootsOriginal = `mediaLocalRoots: params.mediaLocalRoots,`;
const telegramDeliveryRootsPatched =
  `mediaLocalRoots: resolveDynamicReplyMediaLocalRoots(params.mediaLocalRoots, mediaList),`;

const bootHandlerPromptOriginal = `		"If BOOT.md asks you to send a message, use the message tool (action=send with channel + target).",
		"Use the \`target\` field (not \`to\`) for message tool destinations.",`;
const bootHandlerPromptPatched = `		"If BOOT.md asks you to send a message, use the message tool (action=send with channel + to).",
		"Use the \`to\` field (not \`target\`) for message tool destinations.",`;

function patchFile(filePath, source, mutator) {
  let next = source;
  const changes = [];
  const apply = (label, original, replacement) => {
    if (next.includes(replacement)) {
      changes.push(`${label}_already_patched`);
      return;
    }
    if (!next.includes(original)) {
      throw new Error(`Could not find ${label} block in ${filePath}.`);
    }
    next = next.replace(original, replacement);
    changes.push(`patched_${label}`);
  };
  mutator(apply, () => next);
  if (next !== source) writeFileSync(filePath, next, "utf8");
  return { changed: next !== source, changes };
}

const source = readFileSync(runtimeFile, "utf8");
const runtimePatch = patchFile(runtimeFile, source, (apply) => {
  apply("sessions_spawn_param_block", strictParamBlock, tolerantParamBlock);
  apply("acp_resume_session_field", strictResumeBlock, tolerantResumeBlock);
});

const telegramBotSource = readFileSync(telegramBotFile, "utf8");
const telegramBotPatch = patchFile(telegramBotFile, telegramBotSource, (apply) => {
  apply("telegram_bot_media_helper", telegramBotHelperAnchor, telegramBotHelperBlock);
  apply("telegram_bot_command_media_roots", telegramBotCommandRootsOriginal, telegramBotCommandRootsPatched);
  apply("telegram_bot_reply_media_roots", telegramBotReplyRootsOriginal, telegramBotReplyRootsPatched);
});

const telegramDeliverySource = readFileSync(telegramDeliveryFile, "utf8");
const telegramDeliveryPatch = patchFile(
  telegramDeliveryFile,
  telegramDeliverySource,
  (apply) => {
    apply("telegram_delivery_file_url_import", telegramDeliveryImportAnchor, telegramDeliveryImportPatched);
    apply("telegram_delivery_media_helper", telegramDeliveryHelperAnchor, telegramDeliveryHelperBlock);
    apply("telegram_delivery_dynamic_media_roots", telegramDeliveryRootsOriginal, telegramDeliveryRootsPatched);
  },
);

const bootHandlerSource = readFileSync(bootHandlerFile, "utf8");
const bootHandlerPatch = patchFile(bootHandlerFile, bootHandlerSource, (apply) => {
  apply("boot_handler_message_field_hint", bootHandlerPromptOriginal, bootHandlerPromptPatched);
});

console.log(JSON.stringify({
  ok: true,
  runtimeFile,
  telegramBotFile,
  telegramDeliveryFile,
  bootHandlerFile,
  changed: runtimePatch.changed || telegramBotPatch.changed || telegramDeliveryPatch.changed || bootHandlerPatch.changed,
  changes: [
    ...runtimePatch.changes,
    ...telegramBotPatch.changes,
    ...telegramDeliveryPatch.changes,
    ...bootHandlerPatch.changes,
  ],
}, null, 2));
