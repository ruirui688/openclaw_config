# Artifacts

这个目录用于保存“可以提交到 GitHub 的脱敏快照”，而不是原始运行时状态。

## 允许放进来的内容

- 脱敏后的实时配置快照
- 脱敏后的运行状态快照
- 手工整理过的事件记录

## 不允许放进来的内容

- 原始 `openclaw.json`
- 原始日志
- 原始 sqlite / session / queue / media
- 任何真实 token、API key、device identity、审批 token

## 推荐刷新方式

```bash
cd /home/rui/.openclaw
node scripts/export-sanitized-openclaw-config.mjs --out artifacts/config/openclaw.redacted.json
node scripts/export-redacted-openclaw-runtime-snapshot.mjs --out artifacts/runtime-snapshots/latest.md
```

如果你要提交到 GitHub，先做一次 `git diff`，确认脱敏结果符合预期。
