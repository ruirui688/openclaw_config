# openclaw_config

这个仓库是 `/home/rui/.openclaw` 的“白名单式配置仓库”。

目标不是把整个 `.openclaw` 原样推到 GitHub，而是只保存这些适合版本管理的内容：

- 安全的配置模板
- OpenClaw 维修和提交流程文档
- 给后续 Codex / 新会话使用的启动文档
- 本地兼容补丁重放脚本

## 为什么要白名单

`.openclaw` 里有大量不能上 GitHub 的内容，例如：

- `secrets/` 下的 token
- `credentials/` 下的认证数据
- 原始 `openclaw.json` 里的 API key / gateway token
- `identity/`、`devices/` 里的本机身份信息
- `logs/`、`memory/*.sqlite`、`tasks/*.sqlite`、`flows/*.sqlite`
- `media/`、`delivery-queue/`、`telegram/update-offset-*`
- 各 agent 的会话和运行时状态

所以这个仓库只跟踪一小部分“可公开或至少可安全同步”的文件。

## 当前跟踪内容

- `docs/REPO_SCOPE_AND_SECURITY.md`
- `docs/MAINTENANCE_AND_SUBMISSION_RUNBOOK.md`
- `artifacts/README.md`
- `artifacts/config/openclaw.redacted.json`
- `artifacts/runtime-snapshots/latest.md`
- `scripts/export-sanitized-openclaw-config.mjs`
- `scripts/export-redacted-openclaw-runtime-snapshot.mjs`
- `templates/openclaw.template.json`
- `OPENCLAW_MAINTENANCE.md`
- `github-radar-维修与配置经验.md`
- `workspace-openclaw-maintainer/AGENTS.md`
- `workspace-openclaw-maintainer/BOOTSTRAP.md`
- `workspace-openclaw-maintainer/HEARTBEAT.md`
- `workspace-openclaw-maintainer/IDENTITY.md`
- `workspace-openclaw-maintainer/SOUL.md`
- `workspace-openclaw-maintainer/TEMPLATE_LIBRARY.md`
- `workspace-openclaw-maintainer/TOOLS.md`
- `workspace-openclaw-maintainer/playbooks/*.md`
- `workspace-openclaw-maintainer/prompts/*.md`
- `workspace-openclaw-maintainer/skills/openclaw_maintenance_ops/SKILL.md`
- `workspace-openclaw-maintainer/scripts/*.mjs`
- `workspace-openclaw-maintainer/playbooks/codex-startup-maintenance-submission.md`

## 日常更新流程

1. 修配置或修运行时问题。
2. 先验证本机状态，例如：

```bash
openclaw config validate
openclaw health
openclaw channels status --probe
```

3. 如配置结构有变化，刷新脱敏模板：

```bash
node scripts/export-sanitized-openclaw-config.mjs --out templates/openclaw.template.json
```

如果你希望把当前真实状态也以“脱敏快照”的方式保留下来，再执行：

```bash
node scripts/export-sanitized-openclaw-config.mjs --out artifacts/config/openclaw.redacted.json
node scripts/export-redacted-openclaw-runtime-snapshot.mjs --out artifacts/runtime-snapshots/latest.md
```

4. 检查仓库状态：

```bash
git status
```

5. 提交时用能说明改动目的的 message，例如：

```bash
git commit -m "maint: update OpenClaw repair docs and sanitized config template"
```

6. 推送：

```bash
git push -u origin main
```

## 首次初始化参考

远端仓库：

```text
git@github.com:ruirui688/openclaw_config.git
```

如果本地还没初始化：

```bash
cd /home/rui/.openclaw
git init
git branch -M main
git remote add origin git@github.com:ruirui688/openclaw_config.git
```

## 推荐阅读顺序

- `docs/REPO_SCOPE_AND_SECURITY.md`
- `docs/MAINTENANCE_AND_SUBMISSION_RUNBOOK.md`
- `workspace-openclaw-maintainer/playbooks/codex-startup-maintenance-submission.md`
