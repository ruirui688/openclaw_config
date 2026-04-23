# OpenClaw Maintenance And Submission Runbook

## 目标

这份文档规定在 `/home/rui/.openclaw` 里做维修、同步配置仓库、提交到 GitHub 的标准流程。

## 维修前的基本判断

先判断这次任务属于哪一类：

- 只排查，不改文件
- 直接修复
- 升级后的兼容性回归
- Telegram / gateway / channel 链路问题
- MCP / tool materialization 问题
- 记忆、skill、workspace 文档问题

如果用户明确说“先排查，不修改”，就只做证据收集和风险判断，不写文件。

## 标准维修流程

1. 先看本地真相源：

```bash
openclaw config validate
openclaw status
openclaw health
openclaw channels status --probe
```

2. 按问题层次继续取证：

- Telegram / channel：

```bash
openclaw channels logs --channel telegram --lines 200
```

- agent / route / session：

```bash
openclaw agent --agent openclaw-maintainer --message "请用一句话回复：工务长在线" --json
```

- memory：

```bash
openclaw memory search "关键词"
openclaw memory inspect
```

3. 最小闭环修复：

- 优先做最小修改
- 先修根因，再修文档
- 配置、运行时补丁、流程文档分开考虑

4. 修完后再次验证：

```bash
openclaw config validate
openclaw health
openclaw channels status --probe
```

如果是 gateway / OpenClaw runtime / Telegram 补丁相关问题，再补一次：

```bash
systemctl --user status openclaw-gateway --no-pager
```

## 升级后的必做动作

OpenClaw 升级后，不要假设本地兼容补丁还在。

必须复核：

```bash
node workspace-openclaw-maintainer/scripts/reapply-local-openclaw-patches.mjs
openclaw config validate
systemctl --user restart openclaw-gateway
openclaw health
openclaw channels status --probe
```

## 配置仓库同步流程

当本地 `.openclaw` 的结构或维护知识发生变化时，按下面流程同步 GitHub 仓库。

1. 刷新脱敏模板：

```bash
node scripts/export-sanitized-openclaw-config.mjs --out templates/openclaw.template.json
```

2. 检查 Git 变化：

```bash
git status
```

3. 确认没有误收录敏感内容。

4. 提交：

```bash
git add README.md .gitignore docs scripts templates \
  workspace-openclaw-maintainer/playbooks/codex-startup-maintenance-submission.md \
  workspace-openclaw-maintainer/scripts/reapply-local-openclaw-patches.mjs
```

```bash
git commit -m "maint: update OpenClaw repair docs and sanitized config assets"
```

5. 推送：

```bash
git push -u origin main
```

## 推荐的 commit message 风格

尽量让 message 直接表达“这次为什么改”。

推荐前缀：

- `maint:` 维修、运维、补丁、流程
- `docs:` 文档和说明
- `config:` 模板和配置结构
- `fix:` 明确的功能性修复

示例：

- `maint: add Telegram local media reply patch and update runbook`
- `docs: clarify OpenClaw submission workflow for future Codex sessions`
- `config: refresh sanitized OpenClaw template after channel changes`

## 提交后收尾

至少留下这几项：

- 本次请求是什么
- 改了哪些文件
- 运行了哪些验证命令
- 哪些事实已确认
- 还剩什么风险或待办

如果是长期有效的维修经验：

- 写进 `docs/`
- 必要时同步到 `workspace-openclaw-maintainer/playbooks/`
- 如果是本机真实维护经验，也可以补进本地未跟踪的 `OPENCLAW_MAINTENANCE.md`
