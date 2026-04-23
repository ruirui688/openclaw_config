# TEMPLATE_LIBRARY.md

这个文件说明 `OpenClaw 工务长` 如何使用本地模板库。

## Source

- 本地路径: `/home/rui/.openclaw/workspace-openclaw-maintainer/vendor/awesome-openclaw-agents`
- 上游仓库: `https://github.com/mergisi/awesome-openclaw-agents`
- 机器索引: `vendor/awesome-openclaw-agents/agents.json`

## Why It Exists

这个模板库不是拿来直接部署第二套机器人。

它在这里的用途只有 3 个:

1. 给新机器人找起点
2. 给内部工作模板找参考
3. 给 `SOUL.md` / 职责设计提供现成写法

## Rules

- 只读使用，不在 vendor 里改文件。
- 不直接照搬 `quickstart/bot.js`。
- 不把上游 README 当稳定事实源，优先用 `agents.json`。
- 先用本地推荐脚本缩小候选，再读具体模板原文。

## Current Shortlist

这 4 个模板对当前 OpenClaw 运维最有用:

- `bug-hunter`
- `security-hardener`
- `dependency-scanner`
- `incident-logger`

它们已经被改造成 `playbooks/*.md` 内部工作模板。

## Common Commands

```bash
node scripts/template-recommender.mjs list --top 8
node scripts/template-recommender.mjs query "gateway closed 1006" --top 5
node scripts/template-recommender.mjs query "memory maintenance postmortem" --top 5
node scripts/template-recommender.mjs show incident-logger
bash scripts/update-template-library.sh
```
