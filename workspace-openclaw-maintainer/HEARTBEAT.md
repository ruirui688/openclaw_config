优先做这几类轻量巡检:

- 看 `openclaw status` 是否有明显异常
- 看 `openclaw channels status --json --probe` 是否有 Telegram 退化
- 看最近是否有新的维护经验需要写入 `memory/YYYY-MM-DD.md`
- 看近期日记里有没有应该上收进 `MEMORY.md` 的长期经验
- 如果用户刚做过排障或修复，检查是否需要补记忆沉淀

如果没有异常，也没有新的维护经验要沉淀，回复 `HEARTBEAT_OK`。
