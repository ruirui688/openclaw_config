# OpenClaw Redacted Runtime Snapshot

Generated at: 2026-04-23T09:32:15.011Z

This file is intended for version control. Secrets and high-risk identifiers are redacted.

## Config Validate

Command: `openclaw config validate`

Result: ok

```text
Config valid: ~/.openclaw/openclaw.json
```

## Gateway Health

Command: `openclaw health`

Result: ok

```text
Telegram: ok (@github_openclaw_assistant_bot) (624ms)
Agents: main (default), github-radar, openclaw-maintainer, recreation-chatbot, research-orchestrator
Heartbeat interval: disabled (main)
Session store (main): /home/rui/.openclaw/agents/main/sessions/sessions.json (2 entries)
- agent:main:main (8868m ago)
- agent:main:telegram:direct:__REDACTED_NUMERIC_ID__ (23050m ago)
```

## Telegram Channel Probe

Command: `openclaw channels status --probe`

Result: ok

```text
Checking channel status (probe)…
Gateway reachable.
- Telegram github-radar (GitHub OpenClaw Assistant): enabled, configured, running, mode:polling, bot:@github_openclaw_assistant_bot, token:__REDACTED_SECRET__ works
- Telegram openclaw-maintainer (OpenClaw 工务长): enabled, configured, running, mode:polling, bot:@Maintenance_openclaw_bot, token:__REDACTED_SECRET__ works
- Telegram recreation-chatbot (Recreation): enabled, configured, running, mode:polling, bot:@recreation_openclaw_bot, token:__REDACTED_SECRET__ works
- Telegram research-orchestrator (Research Orchestrator): enabled, configured, running, mode:polling, bot:@VreySmartTetrisBot, token:__REDACTED_SECRET__ groups:unmentioned, works, audit ok

Warnings:
- telegram research-orchestrator: Config allows unmentioned group messages (requireMention=false). Telegram Bot API privacy mode will block most group messages unless disabled. (In BotFather run /setprivacy → Disable for this bot (then restart the gateway).)
- Run: openclaw doctor

Tip: https://docs.openclaw.ai/cli#status adds gateway health probes to status output (requires a reachable gateway).
```

## Gateway Service

Command: `systemctl --user status openclaw-gateway --no-pager | head -40`

Result: ok

```text
● openclaw-gateway.service - OpenClaw Gateway (v2026.4.15)
     Loaded: loaded (/home/rui/.config/systemd/user/openclaw-gateway.service; enabled; vendor preset: enabled)
    Drop-In: /home/rui/.config/systemd/user/openclaw-gateway.service.d
             └─05-local-patches.conf, override.conf
     Active: active (running) since Thu 2026-04-23 17:06:46 CST; 25min ago
    Process: __REDACTED_NUMERIC_ID__ ExecStartPre=/home/rui/.nvm/versions/node/v22.22.0/bin/node /home/rui/.openclaw/workspace-openclaw-maintainer/scripts/reapply-local-openclaw-patches.mjs (code=exited, status=0/SUCCESS)
   Main PID: __REDACTED_NUMERIC_ID__ (openclaw-gatewa)
      Tasks: 50 (limit: 76341)
     Memory: 597.1M
        CPU: 25.982s
     CGroup: /user.slice/user-1000.slice/user@1000.service/app.slice/openclaw-gateway.service
             ├─__REDACTED_NUMERIC_ID__ openclaw-gateway "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""
             ├─__REDACTED_NUMERIC_ID__ "npm exec @modelcontextprotocol/server-github" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" "" ""
             ├─__REDACTED_NUMERIC_ID__ sh -c mcp-server-github
             └─__REDACTED_NUMERIC_ID__ node /home/rui/.npm/_npx/3dfbf5a9eea4a1b3/node_modules/.bin/mcp-server-github

Apr 23 17:07:01 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:07:01.217+08:00 [gateway] acp startup identity reconcile (renderer=v1): checked=8 resolved=0 failed=8
Apr 23 17:07:01 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:07:01.219+08:00 [plugins] embedded acpx runtime backend ready
Apr 23 17:07:01 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:07:01.574+08:00 [telegram] [github-radar] starting provider (@github_openclaw_assistant_bot)
Apr 23 17:07:02 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:07:02.329+08:00 [telegram] [recreation-chatbot] starting provider (@recreation_openclaw_bot)
Apr 23 17:07:02 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:07:02.349+08:00 [telegram] [research-orchestrator] starting provider (@VreySmartTetrisBot)
Apr 23 17:07:02 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:07:02.355+08:00 [telegram] [openclaw-maintainer] starting provider (@Maintenance_openclaw_bot)
Apr 23 17:07:03 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:07:03.905+08:00 [ws] ⇄ res ✓ health 2583ms conn=114d88b1…ce30 id=811652f6…7102
Apr 23 17:07:23 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:07:23.081+08:00 [ws] ⇄ res ✓ channels.status 4691ms conn=05978f97…6483 id=9e31377a…058b
Apr 23 17:23:06 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:23:06.552+08:00 [heartbeat] using explicit accountId
Apr 23 17:32:37 ubuntu node[__REDACTED_NUMERIC_ID__]: 2026-04-23T17:32:37.906+08:00 [ws] ⇄ res ✓ channels.status 6377ms conn=665ccdb3…398d id=2e1aa49d…7543
```

## Repo Status

Command: `git -C /home/rui/.openclaw status -sb`

Result: ok

```text
## main...origin/main
 M .gitignore
 M README.md
 M docs/MAINTENANCE_AND_SUBMISSION_RUNBOOK.md
 M scripts/export-sanitized-openclaw-config.mjs
?? OPENCLAW_MAINTENANCE.md
?? artifacts/
?? "github-radar-\347\273\264\344\277\256\344\270\216\351\205\215\347\275\256\347\273\217\351\252\214.md"
?? scripts/export-redacted-openclaw-runtime-snapshot.mjs
?? workspace-openclaw-maintainer/AGENTS.md
?? workspace-openclaw-maintainer/BOOTSTRAP.md
?? workspace-openclaw-maintainer/HEARTBEAT.md
?? workspace-openclaw-maintainer/IDENTITY.md
?? workspace-openclaw-maintainer/SOUL.md
?? workspace-openclaw-maintainer/TEMPLATE_LIBRARY.md
?? workspace-openclaw-maintainer/TOOLS.md
?? workspace-openclaw-maintainer/playbooks/dependency-upgrade-guard.md
?? workspace-openclaw-maintainer/playbooks/incident-memory-logger.md
?? workspace-openclaw-maintainer/playbooks/security-hardener.md
?? workspace-openclaw-maintainer/playbooks/trace-bug-hunter.md
?? workspace-openclaw-maintainer/prompts/
?? workspace-openclaw-maintainer/scripts/template-recommender.mjs
?? workspace-openclaw-maintainer/scripts/update-template-library.sh
?? workspace-openclaw-maintainer/skills/
```

