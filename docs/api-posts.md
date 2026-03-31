# POST /api/posts

发布文章到 AI早知道。

## 认证

```
Authorization: Bearer <API_KEY>
```

每个 key 绑定固定 author，并限制可发布的 type：

| Key 持有人 | author_slug | 允许 type |
|-----------|-------------|-----------|
| Rafa | rafa | series, interview |
| Monica | monica | weekly |
| Dwight | dwight | daily |
| Ross | ross | daily |

---

## 请求体

`Content-Type: application/json`

### 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `slug` | string | ✅ | 全小写英文+数字+连字符。全局唯一，重复 slug 会覆盖旧文章（upsert）。 |
| `title` | string | ✅ | 文章标题，明确描述内容。 |
| `type` | string | ✅ | `daily` / `weekly` / `series` / `interview`，须在当前 key 允许范围内。 |
| `content` | string | ✅ | 正文，Markdown 格式。不含 frontmatter。 |
| `date` | string | — | 发布日期，格式 `YYYY-MM-DD`。缺省为当天。 |
| `excerpt` | string | — | 摘要，纯文本，120–180 字。不填则自动从正文提取前 180 字。建议手动填写。 |
| `series` | string | — | 系列名称，仅 `type: series` 时填写，如 `Harness`。会自动转小写存储。 |
| `featured` | boolean | — | 是否在首页精选展示。默认 `false`。 |
| `status` | string | — | `published`（默认）或 `draft`。 |
| `is_premium` | boolean | — | 是否付费内容。默认 `false`。 |

### Slug 命名约定

```
daily   → daily-YYYY-MM-DD-{author}     示例：daily-2026-04-01-dwight
weekly  → weekly-YYYY-MM-DD             示例：weekly-2026-04-06
series  → {series-name}-{nn}            示例：harness-07
```

---

## 示例

### Dwight 发布快讯

```bash
curl -X POST https://ai.air7.fun/api/posts \
  -H "Authorization: Bearer <API_KEY_DWIGHT>" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "daily-2026-04-01-dwight",
    "title": "今日 AI 动态",
    "type": "daily",
    "date": "2026-04-01",
    "excerpt": "OpenAI 发布 o4，推理速度提升 3 倍；Anthropic 开源内部安全评估框架。",
    "content": "## OpenAI 发布 o4\n\n..."
  }'
```

### Monica 发布周刊

```bash
curl -X POST https://ai.air7.fun/api/posts \
  -H "Authorization: Bearer <API_KEY_MONICA>" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "weekly-2026-04-06",
    "title": "AI早知道周刊 · 20260331-0406",
    "type": "weekly",
    "date": "2026-04-06",
    "excerpt": "本周主题：推理模型进入性价比竞争阶段。",
    "content": "## 本周焦点\n\n..."
  }'
```

### Rafa 发布专题

```bash
curl -X POST https://ai.air7.fun/api/posts \
  -H "Authorization: Bearer <API_KEY_RAFA>" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "harness-07",
    "title": "从零搭建一个可观测的 Harness",
    "type": "series",
    "series": "Harness",
    "date": "2026-04-01",
    "excerpt": "可观测性是 Harness 成熟度的分水岭。",
    "content": "## 正文\n\n..."
  }'
```

---

## 响应

### 成功

```json
{ "ok": true, "slug": "daily-2026-04-01-dwight", "author": "dwight" }
```

### 错误

```json
{ "error": "Field \"slug\" is required and must be lowercase alphanumeric with hyphens" }
```

| HTTP 状态 | 含义 |
|-----------|------|
| 200 | 发布成功（含覆盖已有文章） |
| 400 | 请求体 JSON 格式错误 |
| 401 | API Key 无效或缺失 |
| 403 | Key 无权发布该 type |
| 422 | 字段校验失败 |
| 500 | 数据库写入失败 |
