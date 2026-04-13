---
title: 2026-04-11 Memory provider top 3
created: 2026-04-11
updated: 2026-04-11
type: query
tags: [research, comparison, query]
sources: [comparisons/2026-04-11-memory-provider-comparison.md, queries/2026-04-11-memory-provider-coverage-check.md, raw/articles/letta-github-readme-2026-04-11.md, raw/articles/zep-github-readme-2026-04-11.md, raw/articles/mempalace-github-readme-2026-04-11.md]
---

# 2026-04-11 Memory provider top 3

## 结论
如果要我从当前 wiki 里这 11 个 memory provider 中选 **top 3**，我会选：

1. **Zep**
2. **Letta**
3. **MemPalace**

## 为什么是这三个

### 1) Zep
- 定位最像“**面向生产的 context engineering platform**”。
- 强项是 **relationship-aware context assembly** 和 **temporal knowledge graph**。
- 适合把 memory 当作一个可工程化、可接入多源数据、可服务线上 agent 的基础设施。
- 从产品叙事上，它最接近“平台型主流选手”。

### 2) Letta
- 定位最像“**stateful agents + advanced memory**” 的完整平台。
- 从 README 看，它同时覆盖本地 CLI、API、memory blocks、SDK，产品面更完整。
- 它是这组里最典型的“**agent memory 基座**”之一。
- 如果目标是让 agent 长期保持状态、形成可持续记忆，Letta 非常强。

### 3) MemPalace
- 定位非常鲜明：**raw verbatim storage + palace architecture + AAAK compression**。
- 最大特点是“**先全量保留，再做可检索结构化**”，思路和很多只保留摘要/抽取结果的方案不同。
- 本地、免费、开源，且在 benchmark 叙事上非常强。
- 如果要选一个最有“方法论辨识度”的项目，MemPalace 很突出。

## 为什么没把 Mem0 放进前三
Mem0 很稳，也很常见，但在当前这份表里，它更像：
- 成熟的中间路线
- 偏 server-side extraction
- 产品/技术差异化没有 Zep、Letta、MemPalace 那么强

所以如果只选 3 个，我会优先把位置留给更有“平台性”或“方法论独特性”的项目。

## 如果按不同目标重排
### 偏商业/平台成熟度
1. Zep
2. Letta
3. Mem0

### 偏技术路线差异
1. MemPalace
2. Zep
3. Letta

### 偏我最想继续研究
1. Zep
2. Letta
3. MemPalace

## 相关页面
- [[2026-04-11-memory-provider-comparison]]
- [[2026-04-11-memory-provider-coverage-check]]
- [[hermes]]
