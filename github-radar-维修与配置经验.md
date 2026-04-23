# github-radar 维修与配置经验

## 核心原则

- 先区分“链路打通”与“功能闭环”，不要把规划口径当成已交付能力。
- Telegram 先验证 `channels status --probe`，再谈命令层、cron、MCP。
- 有 systemd 的场景，不要假设登录 shell 的 `PATH` 和代理环境会自动继承。

## 这次实际踩到的问题

- Telegram 通道最初问题不在 bot 创建，而在 OpenClaw Telegram 扩展兼容补丁与代理环境。
- 机器人能收消息，不代表命令层、cron、MCP 都已经生效。
- `github-radar` 最早只有本地 GitHub API 脚本，没有真正接入 GitHub MCP。
- 没有 GitHub token 时，本地脚本还能走公开 API 低速模式，但 GitHub MCP 不适合宣称“已完成”。

## 之后的稳定做法

- Telegram:
  - 用 `channels.telegram.accounts.<id>.customCommands` 注册 bot 菜单命令。
  - GitHub 专用 bot 建议同时设置 `channels.telegram.commands.native = false` 和 `channels.telegram.commands.nativeSkills = false`，否则容易出现菜单过长。
  - `help` 这类名字容易与保留命令冲突，GitHub bot 的帮助入口更稳的是 `/radar`。
  - 用 `openclaw channels status --json --probe` 核对 bot 用户名、收发状态、最近入站时间。
- GitHub MCP:
  - 当前这套 OpenClaw 不要把工作区根目录 `.mcp.json` 当成 `github-radar` 的实际生效入口。
  - 真正生效的配置放在 `~/.openclaw/openclaw.json` 的 `mcp.servers.github`。
  - 不要直接依赖裸 `npx`，启动脚本里显式处理 token 和绝对路径更稳。
  - token 文件放在 `~/.openclaw/secrets/`，不要写进 workspace。
  - 本地脚本最好和 MCP 读同一个 token 文件，避免脚本仍停留在公开限速模式。
  - 验证 GitHub MCP 不要只看 `tools.effective`；这类 MCP 工具是运行时临时注入，真正要看 `openclaw mcp show github` 和实际 MCP 调用是否成功。
- 深度研究:
  - 先产出统一事实包，再做正反双视角，不要让两个子角色各自抓不同事实。
- 定时推送:
  - 真正的推送要落到 `cron/jobs.json`，不是写在 AGENTS.md 里就算完成。
  - Telegram 目标优先复用已有直聊会话的 chat id。

## 运维检查清单

- `openclaw channels status --json --probe`
- `openclaw status --json`
- `openclaw cron list --json`
- `openclaw mcp show github --json`
- `openclaw gateway call tools.effective --params '{\"sessionKey\":\"...\"}' --json`
- 检查 `/home/rui/.openclaw/agents/github-radar/sessions/sessions.json` 里的实际路由和直聊目标
