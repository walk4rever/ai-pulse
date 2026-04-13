---
title: Hermes
created: 2026-04-10
updated: 2026-04-10
type: entity
tags: [research, automation, messaging, platform, hermes]
sources: [raw/transcripts/2026-04-10-research-notes.md]
---

# Hermes

Hermes 是当前这套工作流里的消息与自动化运行时，负责把 Slack、iMessage、cron 和本地工具串起来。

## 关键点
- Slack 通过 Socket Mode 接入。
- iMessage 可通过本机 `imsg` CLI 发送。
- 配置与权限问题往往比功能本身更容易卡住流程。

## 相关页面
- [[ai-air7-fun]]
- [[agent-browser]]
- [[2026-04-10-hermes-slack-report]]
