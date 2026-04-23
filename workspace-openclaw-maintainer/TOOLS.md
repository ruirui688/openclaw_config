# TOOLS.md - OpenClaw Maintainer

## Key Paths

- 主配置: `/home/rui/.openclaw/openclaw.json`
- 维护机器人 workspace: `/home/rui/.openclaw/workspace-openclaw-maintainer`
- 维护机器人 agentDir: `/home/rui/.openclaw/agents/openclaw-maintainer/agent`
- 维护机器人 Telegram token: `/home/rui/.openclaw/secrets/telegram-openclaw-maintainer.token`
- 模板库 vendor: `/home/rui/.openclaw/workspace-openclaw-maintainer/vendor/awesome-openclaw-agents`
- GitHub 雷达 workspace: `/home/rui/.openclaw/workspace-github-radar`
- OpenClaw 维护经验记录: `/home/rui/.openclaw/OPENCLAW_MAINTENANCE.md`

## Useful Checks

- 本地 agent 自检:
  - `openclaw agent --agent openclaw-maintainer --message '请用一句话回复：工务长在线' --json`
- 网关与系统健康:
  - `openclaw status`
  - `openclaw health --json`
  - `openclaw gateway restart`
- Telegram 状态:
  - `openclaw channels status --json --probe`
  - `openclaw channels logs --channel telegram --lines 200`
- 任务与计划:
  - `openclaw cron list --json`
- 记忆与检索:
  - `openclaw memory search '关键词'`
  - `openclaw memory inspect`
  - `openclaw memory reindex`
- 模板库与工作模板:
  - `node scripts/template-recommender.mjs list --top 8`
  - `node scripts/template-recommender.mjs query 'gateway closed 1006' --top 5`
  - `node scripts/template-recommender.mjs show bug-hunter`
  - `bash scripts/update-template-library.sh`
- 本地 OpenClaw 兼容补丁:
  - `node scripts/reapply-local-openclaw-patches.mjs`
  - `systemctl --user show openclaw-gateway.service -p DropInPaths`
  - `openclaw gateway restart`
- MCP 与工具有效性:
  - `openclaw gateway call tools.effective --json`

## Known Local Facts

- 当前本机 Telegram 走代理更稳，已知可用代理是 `http://127.0.0.1:7897`。
- `sessions_spawn.attachments` 已在主配置开启。
- 附件投喂能力当前只确认对 `runtime: "subagent"` 生效，不适用于 ACP runtime。
- OpenClaw 升级后，本地 Telegram 和兼容补丁需要复核，不能默认继承旧状态。
- 当前本地兼容补丁之一是让 `sessions_spawn(runtime="subagent")` 忽略 ACP-only 字段 `streamTo` / `resumeSessionId`，避免研究团队长任务在派发阶段直接失败。
- 该补丁已接入用户级 systemd drop-in：`/home/rui/.config/systemd/user/openclaw-gateway.service.d/05-local-patches.conf`，每次 gateway start 前自动执行。
- 记忆维护不仅是写文件，还要关注检索命中、内容去重、长期记忆上收和过时信息清理。
- 设计新机器人或新工作流时，先用本地模板库脚本缩小范围，再去读具体 `SOUL.md`。
