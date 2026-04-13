---
title: 2026-04-11 Memory provider research framework
created: 2026-04-11
updated: 2026-04-11
type: query
tags: [research, comparison, query]
sources: [comparisons/2026-04-11-memory-provider-comparison.md, queries/2026-04-11-memory-provider-coverage-check.md, queries/2026-04-11-memory-provider-top3.md]
---

# 2026-04-11 Memory provider research framework

## 结论
当前 wiki 里的 11 个 memory provider，最好的研究方式不是“平铺直叙地逐个介绍”，而是**分层 + 分轴 + 分场景**。

## 为什么不能只按列表逐个讲
因为这 11 个项目不是同一种东西：
- 有的是 **平台**（Zep、Letta）
- 有的是 **原始记忆存储 / 编排思路**（MemPalace）
- 有的是 **SDK / API / service**（Mem0、Supermemory、Honcho）
- 有的是 **本地 / 自托管工具**（OpenViking、ByteRover、Holographic）
- 有的是 **知识图谱 / reflect / temporal memory 路线**（Hindsight、Zep）

如果硬把它们按同一个模板讲，容易得到“全都差不多”的错觉。

## 我建议的对比方式

### 1) 先按“产品形态”分层
- **平台型**：Zep、Letta
- **存储 / 编排型**：MemPalace、Hindsight
- **API / SDK 型**：Mem0、Supermemory、Honcho、RetainDB
- **本地 / 自托管型**：OpenViking、ByteRover、Holographic

### 2) 再按“记忆哲学”分轴
- **原始对话优先**：MemPalace
- **结构化 block / state 优先**：Letta
- **关系图 / 时序图谱优先**：Zep、Hindsight
- **抽取 / 摘要优先**：Mem0、Honcho、Supermemory
- **本地可控优先**：OpenViking、ByteRover、Holographic

### 3) 再按“使用场景”分组
- **做 agent 产品**：Zep、Letta
- **做长期记忆系统**：MemPalace、Zep、Hindsight
- **做轻量接入**：Mem0、Supermemory、Honcho
- **做隐私 / 本地部署**：OpenViking、ByteRover、Holographic

## 我建议的研究顺序
### 第一层：先做总览表
固定维度保持一致：
- 定位
- 存储模式
- 成本
- 接入方式
- 核心记忆哲学
- 技术门槛
- 适合谁

### 第二层：再做 3 类深挖
1. **平台型深挖**：Zep、Letta
2. **差异化方法论深挖**：MemPalace
3. **轻量/实用型深挖**：Mem0、Supermemory、OpenViking

### 第三层：最后做选型结论
按任务来选，而不是按名气来选：
- 做 agent 平台 → Zep / Letta
- 做长期记忆范式研究 → MemPalace
- 做快速集成 → Mem0 / Supermemory
- 做本地私有化 → OpenViking / ByteRover / Holographic

## 适合输出的 wiki 结构
如果继续写 wiki，我建议把 memory 主题拆成三层：
- `comparisons/`：总对比和选型
- `concepts/`：单个项目的方法论页，如 Letta、Zep、MemPalace
- `queries/`：深度研究结论、选型建议、研究框架

## 我的建议
这 11 个项目不应该全部用同样的深度去研究。
最合理的方式是：
- **先总览**，找出路线差异
- **再选 3 个重点深挖**
- **最后形成选型地图**

这样产出的 wiki 才会既能查、又能比、还能指导后续研究。

## 相关页面
- [[2026-04-11-memory-provider-comparison]]
- [[2026-04-11-memory-provider-top3]]
- [[2026-04-11-memory-provider-coverage-check]]
