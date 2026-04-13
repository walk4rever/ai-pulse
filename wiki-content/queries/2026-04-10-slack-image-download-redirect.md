---
title: 2026-04-10 Slack image download redirect
created: 2026-04-10
updated: 2026-04-10
type: query
tags: [research, report, messaging, slack, browser]
sources: [raw/assets/slack-image-download-redirect-2026-04-10.html]
---

# 2026-04-10 Slack image download redirect

## 说明
这次收到的“图片”实际是一个 Slack 下载页的 HTML 重定向页面，不是可直接解析的 PNG/JPG 图像文件。

## 观察到的内容
- 页面标题为 Slack。
- `data-props` 中包含 `redirectURL`，指向：
  - `/files-pri/T02EY1SLK-F0AS8H38XA8/download/image.png`
- 直接访问该链接仍返回 Slack 登录页 HTML，而不是原图。

## 结论
- 这张图当前无法在不登录 Slack 的情况下从缓存中提取成真正的图片。
- 先将原始 HTML 作为 raw source 归档，后续若拿到可访问的原图或更完整的附件，再补充到 wiki。

## 相关页面
- [[hermes]]
- [[agent-browser]]
