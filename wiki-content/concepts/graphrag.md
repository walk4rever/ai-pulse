---
title: GraphRAG
created: 2026-04-11
updated: 2026-04-11
type: concept
tags: [research, concept, platform]
sources: [raw/articles/graphrag-github-readme-2026-04-11.md, raw/articles/graphrag-docs-home-2026-04-11.md, raw/articles/graphrag-arxiv-abstract-2026-04-11.md]
---

# GraphRAG

GraphRAG 是 Microsoft Research 提出的 **图谱增强检索范式**，也有同名开源实现。它不是单纯的图数据库，也不是普通向量 RAG，而是把 **实体/关系抽取、层次聚类、社区摘要、分层查询** 串成一条完整链路。

## 一句话定位
- **GraphRAG = 图构建 + 社区摘要 + 分层检索 + 生成**

## 它在做什么
- 切分原始文本为 `TextUnits`
- 抽实体、关系、关键主张
- 用 Leiden 做层次聚类，形成 community hierarchy
- 自底向上生成社区摘要
- 查询时按问题类型选择 Global / Local / DRIFT / Basic Search

## 核心价值
- 解决 baseline RAG 难以“连线”和“做全局综合”的问题
- 适合长文档、私有语料、主题反复出现、概念演化明显的场景
- 对“整个语料库的主线是什么”这类问题，比纯向量召回更合适

## 主要限制
- 索引昂贵，前处理成本高
- 更新不便宜，增量维护比轻量检索更重
- 需要 prompt tuning，不是开箱即满血
- 社区/层级偏静态聚类，对时间演化不是原生强项

## 与相关概念的区别
- 与 `[[2026-04-11-buffett-graph-tech-choice]]` 的关系：GraphRAG 更像主干方法，Graphify 更像图谱前处理手段
- 与 `[[letta]]` 的关系：Letta 走的是 stateful agent / memory platform 路线，GraphRAG 走的是 corpus-level retrieval 路线

## 适合谁
- 做长文集研究、专题分析、知识库问答的人
- 想做跨文档连线、主题穿线、证据回链的人
- 想研究“图如何增强 RAG”这一方法的人

## 我的判断
GraphRAG 不是噱头，但也不是应该无脑直接上的第一选择。它最适合被当作 **高级检索 / 分析层**：当你已经有基础召回，再需要全局综合、主题聚合和证据链时，它的价值才真正出来。
