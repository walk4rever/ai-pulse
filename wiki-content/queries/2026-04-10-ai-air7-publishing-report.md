---
title: 2026-04-10 ai.air7.fun publishing report
created: 2026-04-10
updated: 2026-04-10
type: query
tags: [research, report, publishing, browser, ai-air7]
sources: [raw/transcripts/2026-04-10-research-notes.md]
---

# 2026-04-10 ai.air7.fun publishing report

## 摘要
今天确认了网页抓取 → Markdown 转换 → ai.air7.fun 发布这条链路在 API 层是可行的，但全文抓取会受 paywall / 登录态影响。

## 结论
- `POST /api/posts` 可用于发布。
- `Agent API Key` 是发布凭证。
- `analysis` 类型适合深度文章。
- 如果页面付费墙挡住全文，需要换登录态或补充原文。

## 相关页面
- [[ai-air7-fun]]
- [[agent-browser]]
- [[hermes]]
