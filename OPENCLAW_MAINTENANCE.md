# OpenClaw Maintenance And Configuration Notes

## Purpose

This file records practical repair and configuration experience for the local OpenClaw setup, with emphasis on Telegram channel access and the `github-radar` agent.

## Current Working Baseline

- Working directory: `/home/rui/.openclaw`
- Telegram bot account bound to agent: `github-radar`
- Telegram bot username: `@github_openclaw_assistant_bot`
- Main config file: `/home/rui/.openclaw/openclaw.json`
- Telegram token is stored in a local secret file, not inline in docs

## What Actually Broke

The main problem was not the GitHub research agent itself.

The real failure path was Telegram channel connectivity and runtime loading:

- The local agent could answer when invoked directly.
- Telegram API access from this host was not reliably available without a proxy.
- OpenClaw `2026.4.5` had a local Telegram bundled setup/loading compatibility issue in this environment.
- During the failure window, Telegram inbound events did not actually reach the gateway session layer.

## Confirmed Lessons

### 1. Split channel setup from bot capability setup

Do not mix these together:

- creating the Telegram bot
- binding the token
- verifying network/proxy
- routing to the target agent
- testing the agent skills

The correct order is:

1. token
2. proxy
3. route binding
4. gateway restart
5. Telegram minimal reply test

Only after that should GitHub hot/emerging/research features be tested.

### 2. Local agent self-test must happen early

This is the fastest way to cut the problem space.

Example:

```bash
openclaw agent --agent github-radar --message '请用一句话回复：机器人在线' --json
```

If this works, the model/prompt/workspace is fine, and the issue is in the channel path.

### 3. `probe` success is not the same as end-to-end success

Telegram `probe` can pass while runtime message handling is still broken or not fully loaded.

Useful distinction:

- `probe ok`: token and Telegram API reachability look fine
- `lastInboundAt = null`: no real inbound message was processed
- local agent works: channel issue, not agent issue

### 4. Proxy is a first-class dependency here

In this host environment, Telegram should be treated as proxy-dependent.

Known working proxy:

```text
http://127.0.0.1:7897
```

Quick check:

```bash
curl -I -x http://127.0.0.1:7897 https://api.telegram.org
```

If direct access fails and proxied access succeeds, do not keep debugging higher layers first.

### 5. Status surfaces can disagree

During troubleshooting, different OpenClaw status views did not always present the exact same runtime picture.

Do not trust only one command. Cross-check:

```bash
openclaw status
openclaw channels status --json --probe
openclaw health --json
openclaw channels logs --channel telegram
openclaw sessions --agent github-radar --json
```

Decision rule:

- if there is no Telegram session trace and no inbound timestamp, the message did not enter the agent path
- if local agent works, do not waste time rewriting prompts or workspace docs

## Minimal Recovery Procedure

When Telegram looks connected but the bot does not answer, use this order:

1. Verify local agent:

```bash
openclaw agent --agent github-radar --message '请用一句话回复：机器人在线' --json
```

2. Verify Telegram API via proxy:

```bash
TOKEN=$(cat /home/rui/.openclaw/secrets/telegram-github-radar.token)
curl -sS -x http://127.0.0.1:7897 "https://api.telegram.org/bot${TOKEN}/getWebhookInfo"
curl -sS -x http://127.0.0.1:7897 "https://api.telegram.org/bot${TOKEN}/getUpdates?limit=5"
```

3. Check channel runtime:

```bash
openclaw channels status --json --probe
openclaw channels logs --channel telegram --lines 200
```

4. Restart gateway if config or channel behavior is stale:

```bash
openclaw gateway restart
```

5. Ask for a minimal Telegram message:

```text
/start
```

Then re-check:

- `lastInboundAt`
- Telegram logs
- session creation under `agents/github-radar/sessions/`

## Local Compatibility Patch History

This environment required local runtime compatibility patches for the installed OpenClaw package.

Patched files:

- `/home/rui/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/dist/extensions/telegram/index.js`
- `/home/rui/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/dist/loader-BkajlJCF.js`
- `/home/rui/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/dist/openclaw-tools-CUmYpN1l.js`

Reason:

- Telegram bundled setup/plugin loading was not behaving correctly in this local installation.
- `sessions_spawn(runtime="subagent")` treated ACP-only fields such as `streamTo: "parent"` and `resumeSessionId` as fatal errors.
- In practice, LLM-driven orchestrators sometimes attach ACP-only fields to subagent payloads despite prompt constraints, causing long-running research-team member dispatch to fail before work starts.

Important:

- These are local runtime patches.
- They may be overwritten by future OpenClaw updates.
- After updating OpenClaw, re-verify Telegram startup before assuming the old behavior still holds.
- After updating OpenClaw, reapply local runtime patches:

```bash
node /home/rui/.openclaw/workspace-openclaw-maintainer/scripts/reapply-local-openclaw-patches.mjs
openclaw gateway restart
```

Automatic reapply:

- User systemd drop-in:
  - `/home/rui/.config/systemd/user/openclaw-gateway.service.d/05-local-patches.conf`
- It runs the patch script through `ExecStartPre` before every gateway start.
- Therefore an OpenClaw update that restarts the gateway should automatically reapply local runtime patches before loading the updated gateway process.
- If the gateway service file is recreated by an update, verify this drop-in still exists with:

```bash
systemctl --user show openclaw-gateway.service -p DropInPaths
```

### Local sessions_spawn compatibility patch

The local `openclaw-tools-CUmYpN1l.js` patch makes `sessions_spawn` tolerant of ACP-only fields when `runtime !== "acp"`:

- `streamTo` is ignored for `runtime: "subagent"` instead of returning `streamTo is only supported for runtime=acp`.
- `resumeSessionId` is ignored for `runtime: "subagent"` instead of returning `resumeSessionId is only supported for runtime=acp`.
- ACP behavior is preserved by forwarding `streamTo` and `resumeSessionId` only when `runtime: "acp"`.

Validated behavior:

- `research-orchestrator` can launch `researcher`, `librarian`, and `critic` as parallel `runtime: "subagent"` workers even if the model accidentally includes `streamTo: "parent"`.
- A long-task pressure test on `longtask-stability` successfully launched all three workers; researcher completed and librarian/critic progressed past the former immediate-failure window.

## Temporary Access Relaxation

To reduce pairing friction during live debugging, Telegram DMs were temporarily opened.

Relevant config shape:

- `channels.telegram.accounts.github-radar.dmPolicy = "open"`
- `channels.telegram.accounts.github-radar.allowFrom = ["*"]`

This is acceptable for temporary debugging only.

Recommended follow-up:

- replace wildcard access with a Telegram user ID allowlist
- keep secrets in files, not inline in config

## Files That Matter Most

- config: `/home/rui/.openclaw/openclaw.json`
- token file: `/home/rui/.openclaw/secrets/telegram-github-radar.token`
- Telegram state dir: `/home/rui/.openclaw/telegram`
- GitHub radar workspace: `/home/rui/.openclaw/workspace-github-radar`
- GitHub radar script: `/home/rui/.openclaw/workspace-github-radar/scripts/github-radar.mjs`

## GitHub MCP Root Cause And Fix

The GitHub MCP issue was not caused by a bad token or a broken launch script.

What was actually true:

- the token file existed and was valid
- the GitHub MCP startup script could launch successfully
- the agent session still did not expose usable GitHub MCP tools at runtime

The real root cause was configuration scope.

- The workspace root file `/home/rui/.openclaw/workspace-github-radar/.mcp.json` looked correct, but it was not the effective source of truth for this local OpenClaw runtime.
- In this installation, plugin discovery scans the workspace extension root `.openclaw/extensions`, not arbitrary files in the workspace root.
- Embedded Pi runtime MCP loading ultimately used enabled bundle MCP plus global `mcp.servers` config.
- At the time of failure, `/home/rui/.openclaw/openclaw.json` had no `mcp.servers.github` entry, so runtime materialization of GitHub MCP tools produced zero tools.

The stable fix was:

1. add `mcp.servers.github` to `/home/rui/.openclaw/openclaw.json`
2. point it at `/home/rui/.openclaw/workspace-github-radar/scripts/start-github-mcp.sh`
3. restart the gateway
4. verify with real runtime materialization, not just static config inspection

Current working config:

- `/home/rui/.openclaw/openclaw.json`
- `mcp.servers.github.command = /home/rui/.openclaw/workspace-github-radar/scripts/start-github-mcp.sh`

Important validation rule:

- `tools.effective` is not a reliable proof for GitHub MCP presence here
- GitHub MCP tools are materialized at runtime during agent turns
- correct validation is:
  - `openclaw mcp show github --json`
  - real MCP tool materialization
  - real MCP tool execution

Confirmed good state after repair:

- `openclaw mcp show github` returns the configured startup script
- runtime materialization returns 26 GitHub MCP tools
- real MCP execution succeeds, for example repository search

Cleanup done to avoid future confusion:

- removed `/home/rui/.openclaw/workspace-github-radar/.mcp.json`
- kept `/home/rui/.openclaw/openclaw.json` as the single active MCP source of truth

## GitHub MCP Reflection

- Do not trust a plausible config file just because it exists in the workspace.
- Separate “file exists”, “CLI can start”, and “runtime actually consumes it”; these are three different checks.
- When OpenClaw mixes static tools and runtime-materialized MCP tools, static inventories can mislead debugging.
- If two config locations appear to describe the same feature, reduce to one source of truth immediately after repair.
- For future MCP debugging, prove the chain in this order:
  1. config source of truth is known
  2. launch command works
  3. runtime materializes tools
  4. one real MCP call succeeds

## Operating Rule Going Forward

When a Telegram bot "has no response", do not start by changing prompts, rewriting agent identity, or expanding features.

First prove these five points in order:

1. local agent replies
2. proxy reaches Telegram API
3. channel probe is healthy
4. inbound timestamp updates
5. Telegram-created session appears

Only then debug reply formatting or business logic.

## Reply Style Maintenance Reflection

This maintenance round exposed a separate class of problems: the bot was online,
but long Telegram answers still felt machine-like.

The key lesson is to separate three layers clearly.

### 1. Memory is not the same thing as delivery

Long-term memory can help the agent remember:

- preferred language
- preferred answer length
- whether the user likes summaries first

But memory does not decide how Telegram finally splits a long message.

If the model still emits one long answer, Telegram delivery logic can still turn
it into awkward bubbles. So "remember the user's style" is useful, but it is not
the transport fix.

### 2. There are three distinct control layers

For reply quality, treat these as separate knobs:

1. preference layer
   - `MEMORY.md`
   - `USER.md`
   - agent instructions like `AGENTS.md` / `SOUL.md`
2. generation layer
   - team lead prompt rules such as "default short answer, expand only on demand"
3. transport layer
   - Telegram streaming and chunking behavior in the runtime

Bad maintenance habit:

- changing only prompts and expecting delivery behavior to look human

Better maintenance habit:

- decide which layer is actually responsible before editing anything

### 3. `chunkMode: "newline"` is not a universal Telegram fix

It is tempting to think "split by paragraph" should be enough.

In this environment, that was not true for long Markdown reports.

Real replay result on a stored 6473-character Telegram answer:

- previous behavior: 3 chunks
  - 3978
  - 186
  - 2345
- naive newline-first plan: 74 fragments
- semantic planner + HTML-safe fallback: 3 chunks
  - 2464
  - 1951
  - 2091

So the correct strategy was not "always split by newline".

The correct strategy was:

1. first group by natural sections
2. keep headings with their following content
3. merge tiny tail sections back into the previous chunk when safe
4. only then fall back to Telegram HTML-safe splitting

### 4. Config-only changes and runtime patches behave differently

This round confirmed another important distinction:

- account config changes such as `streaming`, `chunkMode`, and `textChunkLimit`
  were hot-reloaded successfully
- runtime code changes inside the installed OpenClaw package required a gateway
  restart before they could take effect

Maintenance rule:

- if the fix lives in `openclaw.json`, test hot reload first
- if the fix lives in `dist/*.js`, assume restart is required

### 5. Use the official restart path, but expect a transient false negative

Preferred command:

```bash
openclaw gateway restart
```

Do not kill processes manually unless restart tooling is unavailable.

Observed behavior:

- immediately after restart, `openclaw gateway status` can briefly show
  `Runtime: stopped` or `RPC probe: failed`
- a few seconds later the service may come back normally

So the maintenance sequence should be:

1. restart
2. wait a few seconds
3. check `openclaw gateway status`
4. if still down, inspect:
   - `journalctl --user -u openclaw-gateway.service -n 120 --no-pager`
   - `/tmp/openclaw/openclaw-YYYY-MM-DD.log`

Do not overreact to the first status sample taken during service turnover.

### 6. Validate UX fixes with a real stored sample, not intuition

This repair was safer because the delivery logic was tested against a real
Telegram session artifact instead of a toy string.

Best practice:

- replay one real long answer from `agents/<agent>/sessions/*.jsonl`
- measure actual chunk counts and chunk lengths
- compare before vs after
- also replay one short answer to make sure normal replies are not over-split

### 7. Reflection on maintenance discipline

The biggest maintenance risk with OpenClaw here is not just breakage. It is
editing the wrong layer because several layers can look similar from the user
side.

The corrected discipline should be:

- first identify whether the issue is capability, configuration, memory,
  prompting, or transport
- then change the smallest layer that actually owns the behavior
- record whether the fix is durable config or fragile local runtime patch

For this setup, the durable pattern is:

- use memory and agent instructions to bias toward concise, layered answers
- use runtime delivery logic to make long answers split like natural sections
- verify with real Telegram-shaped samples, not abstract assumptions
