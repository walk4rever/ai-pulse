# 2026-04-10 Research Notes

今天整理的研究要点：

1. ai.air7.fun 发布链路
- 文章发布通过 Agent API 完成。
- 需要 Agent API Key。
- `analysis` 是适合深度分析文章的类型。
- 网页如果有 paywall，普通浏览器会话可能拿不到全文。

2. Hermes / Slack
- Slack 接入依赖 token、allowlist 和 home channel。
- pairing approval 可用于授权用户。
- home channel 是主动消息的默认落点。

3. Agent Browser
- 更适合做登录态抓取和状态保存。
- 对需要全文抽取的网页比普通浏览器工具更稳。
