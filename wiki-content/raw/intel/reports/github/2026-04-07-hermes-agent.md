# Hermes-Agent 深度解读

**仓库**：[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)  
**标签**：AI Agent / MCP / Multi-platform / Event-Driven

---

## 项目定位

Hermes-Agent 被定位为"The agent that grows with you"（与你共同成长的智能体）。其核心理念是让 AI 智能体具备**持久记忆**和**持续进化**能力，而非每次交互都是独立的" stateless"会话。

## 核心架构：EventBridge

```
┌─────────────────────────────────────────────────────────────┐
│                     Hermes-Agent                            │
├─────────────────────────────────────────────────────────────┤
│  EventBridge (后台线程)                                      │
│  ├── 轮询 SessionDB 新消息                                   │
│  ├── 维护内存事件队列 + waiter 支持                          │
│  └── 直接读取 sessions.json + SessionDB（无网关依赖）        │
├─────────────────────────────────────────────────────────────┤
│  FastMCP Server (stdio 传输)                                 │
│  └── 暴露 9 大工具接口                                       │
└─────────────────────────────────────────────────────────────┘
```

### 关键设计决策

1. **零新依赖**：复用现有 mcp>=1.2.0 可选依赖
2. **无网关依赖读取**：直接读取 SessionDB，最大化可靠性
3. **事件驱动**：EventBridge 后台线程确保实时性

## 暴露的 9 大 MCP 工具

| 工具 | 功能 |
|------|------|
| `conversations_list` | 跨平台列出活跃会话 |
| `conversation_get` | 获取单个会话详情 |
| `messages_read` | 读取消息历史 |
| `attachments_fetch` | 提取非文本附件内容 |
| `events_poll` | 游标后拉取新事件 |
| `events_wait` | 长轮询/阻塞直到新事件（近实时） |
| `messages_send` | 通过 send_message_tool 发送至任意平台 |
| `channels_list` | 浏览可用消息目标 |
| `permissions_list_open` | 列出待审批请求 |
| `permissions_respond` | 审批/拒绝请求 |

## 与 OpenClaw 的异同

| 维度 | Hermes-Agent | OpenClaw |
|------|--------------|----------|
| 协议 | MCP (原生) | ACP |
| 记忆 | SessionDB 持久化 | 短期会话 |
| 工具数 | 9 个 | 9 个（channel bridge） |
| 定位 | 跨平台智能体中枢 | 桌面端 AI 伙伴 |

## 产业意义

1. **MCP 生态深化**：Hermes-Agent 的 MCP server 让任何 MCP 客户端（Claude Code, Cursor, Codex 等）都能与 Hermes 对话
2. **智能体协作网络**：多智能体之间通过共享记忆实现协作
3. **"成长"范式**：区别于传统"工具调用"模式，智能体可积累经验

## 技术亮点

- **多平台消息聚合**：统一管理 Discord、Telegram、Slack、飞书等多平台消息
- **权限审批流**：企业级需求，支持人工审批敏感操作
- **近实时事件**：events_wait 长轮询实现准实时响应

---

**趋势观察**：当 Anthropic 限制第三方智能体使用配额时，开源社区正通过 MCP 协议构建更开放的智能体生态。Hermes-Agent 代表了"智能体作为平台"的新路径。