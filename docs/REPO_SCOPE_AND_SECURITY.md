# Repo Scope And Security

## 仓库定位

这个仓库是 `.openclaw` 的“配置与维护知识库”，不是完整运行时备份。

它解决两个问题：

1. 把 OpenClaw 的关键配置结构、维修流程、补丁脚本放进 Git 管理。
2. 避免把本机敏感数据、动态状态和历史会话推到 GitHub。

## 明确纳入版本管理的内容

- 说明仓库用途和边界的文档
- OpenClaw 维护与提交流程
- 后续新会话的 Codex 启动文档
- 脱敏后的配置模板
- 本地兼容补丁脚本

## 明确排除的内容

下面这些内容默认不应进 GitHub：

- `openclaw.json`
- `openclaw.json.bak*`
- `secrets/`
- `credentials/`
- `identity/`
- `devices/`
- `logs/`
- `media/`
- `delivery-queue/`
- `telegram/update-offset-*`
- `exec-approvals.json`
- `update-check.json`
- `memory/*.sqlite`
- `tasks/*.sqlite*`
- `flows/*.sqlite*`
- `cron/runs/`
- 各 workspace 内的运行态、会话态、缓存和临时文件

## 提交前检查清单

每次准备 `git commit` 前，至少看一遍下面几点：

1. `git status` 里不能出现原始 `openclaw.json`。
2. 不能出现 `secrets/`、`credentials/`、`identity/`、`devices/`。
3. 不能出现 `*.sqlite`、`*.sqlite-wal`、`*.sqlite-shm`。
4. 不能出现日志、媒体、会话偏移和投递队列文件。
5. 如果更新了配置模板，先确认里面没有真实 token、API key、gateway auth token。

## 配置模板的原则

`templates/openclaw.template.json` 的用途是：

- 保留当前配置结构
- 记录 agent / channel / binding / MCP / plugin 的拓扑
- 用占位符替换敏感值

它不是直接可运行的“生产配置”，部署前必须手工替换占位符。

## 如果仓库未来改成公开

当前这套白名单结构已经尽量避免泄露敏感信息，但如果仓库未来改成公开，仍然建议额外注意：

- 不要把真实 Telegram 用户 ID、群 ID、审批人 ID 写进模板
- 不要把私有代理地址或私有 MCP 凭据写进文档
- 不要把外部 API 的真实 base URL + key 成对公开
- 不要把修复过程中的原始报错整段复制进文档，如果里面带 token/path/ID
