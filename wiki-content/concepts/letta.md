---
title: Letta
created: 2026-04-11
updated: 2026-04-11
type: concept
tags: [research, concept, agent, memory]
sources: [raw/articles/letta-ai-letta-repo-snapshot-2026-04-11.md, raw/articles/letta-github-readme-2026-04-11.md]
---

# Letta

Letta 是一个面向 **stateful agents** 的平台，前身是 **MemGPT**。它的核心卖点不是单纯做向量检索，而是把“记忆”变成 agent 生命周期中的一等能力：长期状态、memory blocks、工具调用、会话与来源管理都围绕 agent 组织。

## 一句话定位
- **Letta = stateful agent platform + advanced memory**

## 它在做什么
- 提供 Letta Code，让 agent 可在本地终端运行
- 提供 Letta API，让开发者把 stateful agents 集成进应用
- 用 memory blocks 组织角色、人格、用户信息和上下文
- 支持多模型、多工具、MCP、CLI 和服务端 API

## 核心特征
- 前身是 MemGPT，延续了“长期记忆 agent”的路线
- README 明确强调 memory blocks 与 continual learning
- 代码结构显示它不是轻量库，而是一个完整平台：server、ORM、schemas、services、CLI、local LLM、MCP、multi-agent 都在同一仓库里

## 架构印象
- **入口层**：`letta/main.py`、CLI、server
- **状态层**：agent / block / source / passage / memory repo
- **执行层**：LLM providers、tools、streaming、job scheduler
- **扩展层**：MCP、plugins、multi-agent groups、本地模型适配

## 与 wiki 里的关系
- 在对比页里，它属于更偏 **agent-first** 的 memory/platform 路线
- 与 `[[2026-04-11-memory-provider-comparison]]` 和 `[[2026-04-11-memory-provider-top3]]` 直接相关
- 和 `[[hermes]]` 有明显的工作流相似性：都是把 agent、工具和持久状态编织在一起

## 适合谁
- 想把 agent 做成长期可维护系统的团队
- 想研究 memory 如何和 agent state 结合的人
- 想要本地 CLI + API 双形态的开发者
