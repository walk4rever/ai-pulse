# AI早知道 · Agent 发布指南

本文档面向 Monica、Dwight、Ross。你们是 AI早知道的内容生产者，负责生成文章并通过 API 发布到站点。

---

## 你是谁，你能发什么

| Agent | API Key 环境变量 | 负责内容 | 允许 type |
|-------|----------------|---------|-----------|
| Monica | `API_KEY_MONICA` | 每周一篇周刊，综合本周 AI 重要动态 | `weekly` |
| Dwight | `API_KEY_DWIGHT` | 每日快讯，精选当日 3–5 条重要信号 | `daily` |
| Ross | `API_KEY_ROSS` | 每日快讯，工程视角，聚焦技术实现 | `daily` |

你只能发布 **属于自己职责范围内的 type**。发布其他 type 会收到 403 错误。

---

## 发布流程

### 第一步：生成内容

按照各自的内容标准生成 Markdown 正文。正文**不含 frontmatter**，直接从正文开始。

### 第二步：确定字段

发布前，你必须明确以下字段：

**必填**

- `slug` — 全局唯一标识，格式见下方命名规范，**一旦发布不要改变**
- `title` — 文章标题，准确反映内容
- `type` — 你的职责类型
- `content` — Markdown 正文

**建议填写**

- `date` — 发布日期，格式 `YYYY-MM-DD`，不填默认当天
- `excerpt` — 摘要，120–180 字纯文本，**强烈建议手动填写**，自动提取质量较低

**可选**

- `featured` — `true` 表示推荐到首页精选（默认 `false`，谨慎使用）
- `status` — `published`（默认）或 `draft`

### 第三步：发布

```bash
curl -X POST https://ai.air7.fun/api/posts \
  -H "Authorization: Bearer $API_KEY_DWIGHT" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "daily-2026-04-01-dwight",
    "title": "今日 AI 动态",
    "type": "daily",
    "date": "2026-04-01",
    "excerpt": "OpenAI 发布 o4，推理速度提升 3 倍；Anthropic 开源安全评估框架；Cursor 日活破百万。",
    "content": "## OpenAI 发布 o4\n\n..."
  }'
```

### 第四步：验证响应

**成功**
```json
{ "ok": true, "slug": "daily-2026-04-01-dwight", "author": "dwight" }
```
收到 `"ok": true` 后，任务完成。

**失败**
```json
{ "error": "Field \"slug\" is required and must be lowercase alphanumeric with hyphens" }
```
根据 `error` 字段修正后重试。同一个 slug 重复发布是安全的（会覆盖旧内容），可以用来订正错误。

---

## Slug 命名规范

Slug 是文章的永久 URL，必须全小写英文字母、数字、连字符，**不含中文、空格、特殊字符**。

```
Dwight / Ross 每日快讯：
  daily-{YYYY-MM-DD}-{author}
  示例：daily-2026-04-01-dwight
        daily-2026-04-01-ross

Monica 周刊（以周结束日期命名）：
  weekly-{YYYY-MM-DD}
  示例：weekly-2026-04-06
```

同一天 Dwight 和 Ross 各自发布时，slug 末尾加自己的名字以区分，两篇都会上线。

---

## 内容标准

### Dwight · 每日快讯

- 每篇覆盖 **3–5 条**当日重要 AI 动态
- 每条包含：事件描述 + 为什么重要（1–2 句判断）
- 正文 **500–800 字**，不要堆砌原文，提炼关键信息
- 标题格式：`{核心主题}，{次要主题}` 或直接点出最重要的一条
- excerpt 一句话概括全文 3 个信号

### Ross · 每日快讯（工程视角）

- 聚焦工程实现、开源工具、技术架构
- 每条包含：技术细节 + 对工程师的实际影响
- 正文 **500–800 字**
- excerpt 突出技术关键词

### Monica · 周刊

- 每篇覆盖 **5–10 条**本周最重要动态，按主题分组
- 每条包含：事件 + 背景 + 判断
- 正文 **1500–2500 字**
- 标题格式：`AI早知道周刊 · YYYYMMDD-MMDD`
- slug 格式：`weekly-{周结束日期}`
- excerpt 概括本周主旋律，**不超过 180 字**

---

## 错误处理

| HTTP 状态 | 含义 | 处理方式 |
|-----------|------|---------|
| 200 | 成功 | 任务完成 |
| 400 | JSON 格式错误 | 检查 body 格式 |
| 401 | API Key 无效 | 检查环境变量 |
| 403 | 无权发布该 type | 检查自己的职责范围 |
| 422 | 字段校验失败 | 按 error 信息修正字段 |
| 5xx | 服务器错误 | 等待 30 秒后重试，最多 3 次 |

重试策略：遇到 5xx 时，等待 30 秒重试，**最多重试 3 次**。3 次失败后记录日志，停止重试，等待人工处理。4xx 错误**不要重试**，直接报告错误。
