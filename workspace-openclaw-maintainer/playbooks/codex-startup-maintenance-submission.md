# Codex Startup, Maintenance, And Submission Playbook

## Purpose

这份 playbook 给后续新开的 Codex 会话使用。

目标只有三个：

1. 快速恢复 OpenClaw Maintainer 的上下文。
2. 按正确方式排查和维修 OpenClaw。
3. 在需要提交到 GitHub 时，按安全边界完成 commit 和 push。

## Session Startup Order

每次新会话启动后，按下面顺序读：

1. `SOUL.md`
2. `USER.md`
3. `MEMORY.md`
4. `memory/` 里今天和昨天的记录
5. `TOOLS.md`
6. `/home/rui/.openclaw/docs/MAINTENANCE_AND_SUBMISSION_RUNBOOK.md`

如果任务和配置仓库有关，再补读：

7. `/home/rui/.openclaw/README.md`
8. `/home/rui/.openclaw/docs/REPO_SCOPE_AND_SECURITY.md`

## Mode Gate

开工前先判断模式：

- `diagnose-only`
- `direct-fix`
- `upgrade-regression`
- `memory-curation`
- `security-audit`
- `workflow-or-docs`

如果用户明确说：

- “先排查，不修改”
- “只检查”
- “先告诉我哪里有问题”

就进入 `diagnose-only`，不写文件、不重启服务、不提交 Git。

## Internal Routing

对外始终保持“工务长”单入口，对内按问题分流：

- gateway / Telegram / channel / binding / runtime 补丁：
  - 底座维护员
- MCP / tool materialization / server 启动与鉴权：
  - MCP 维护员
- skill / prompt / memory / 回复风格 / 长期记忆：
  - 技能维护员
- 升级后跨层回归、根因不清：
  - 至少两名维护员并行核对

## Evidence First

不要先猜，先看证据。

默认先查：

```bash
openclaw config validate
openclaw status
openclaw health
openclaw channels status --probe
```

需要时继续查：

```bash
openclaw channels logs --channel telegram --lines 200
openclaw agent --agent openclaw-maintainer --message "请用一句话回复：工务长在线" --json
openclaw memory search "关键词"
openclaw gateway call tools.effective --json
```

## Work Procedure

每次维修按这个结构推进：

1. 现象
2. 已确认事实
3. 推断
4. 风险
5. 最小修改
6. 验证

不要把“配置看起来对”当成“已经修好”。
必须给出运行态证据。

## Verification Standard

不同类型的问题，验证要求不同：

- 配置类：
  - `openclaw config validate`
- gateway 类：
  - `openclaw health`
  - `systemctl --user status openclaw-gateway --no-pager`
- Telegram 类：
  - `openclaw channels status --probe`
  - 必要时看 `openclaw channels logs --channel telegram --lines 200`
- 补丁类：
  - `node scripts/reapply-local-openclaw-patches.mjs`
  - gateway 重启后重新验证

## Git Submission Rules

如果这次改动需要同步到 GitHub 配置仓库：

1. 绝不提交原始 `openclaw.json`
2. 绝不提交 `secrets/`、`credentials/`、`identity/`、`devices/`
3. 绝不提交 sqlite、日志、媒体、delivery queue
4. 只提交白名单文件

同步步骤：

```bash
cd /home/rui/.openclaw
node scripts/export-sanitized-openclaw-config.mjs --out templates/openclaw.template.json
git status
git add README.md .gitignore docs scripts templates \
  workspace-openclaw-maintainer/playbooks/codex-startup-maintenance-submission.md \
  workspace-openclaw-maintainer/scripts/reapply-local-openclaw-patches.mjs
git commit -m "maint: update OpenClaw repair docs and sanitized config assets"
git push -u origin main
```

## Commit Message Rule

commit message 必须说明“本次改动是什么”。

优先使用：

- `maint:`
- `docs:`
- `config:`
- `fix:`

不要用空泛 message，例如：

- `update`
- `fix bug`
- `changes`

## Submission Package

每次对外收口，至少带上这些内容：

- `Request`
- `Mode`
- `Files changed`
- `Checks run`
- `Confirmed facts`
- `Changes made`
- `Verification result`
- `Risks`
- `Rollback`
- `Follow-ups`

## Memory Capture

如果结果具有复用价值：

- 维修流程 -> 写进 `/home/rui/.openclaw/docs/`
- Maintainer 会话流程 -> 写进当前 playbook
- 本机真实运维经验 -> 写进本地 `OPENCLAW_MAINTENANCE.md`
- 长期偏好或稳定规则 -> 写进 `MEMORY.md` 或 `TOOLS.md`
