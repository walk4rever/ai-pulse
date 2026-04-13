# Wiki Schema

## Domain
AI / 自动化 / 发布工作流的研究知识库，重点记录 Hermes、Slack、iMessage、浏览器自动化、ai.air7.fun 发布链路与相关操作经验。

## Conventions
- File names: lowercase, hyphens, no spaces.
- Every page uses YAML frontmatter.
- Use `[[wikilinks]]` to connect pages; new pages should have at least 2 outbound links.
- When updating a page, bump the `updated` date.
- Every new page must be added to `index.md` under the right section.
- Every action should be appended to `log.md`.
- Raw sources live under `raw/` and are treated as immutable.

## Frontmatter
```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | query | summary
tags: [research, automation]
sources: [raw/transcripts/example.md]
---
```

## Tag Taxonomy
- research
- automation
- workflow
- messaging
- browser
- publishing
- platform
- agent
- slack
- imessage
- hermes
- ai-air7
- wiki
- report
- concept
- entity
- comparison
- query

Rule: tags must come from this taxonomy. Add new tags here before using them.

## Page Thresholds
- Create a page when a topic appears in 2+ sources or is central to one source.
- Add to an existing page when a source mentions something already covered.
- Do not create pages for passing mentions.
- Split a page over ~200 lines.

## Update Policy
When new info conflicts with existing content:
1. Prefer newer sources when appropriate.
2. If both claims matter, record both with dates and sources.
3. Mark related pages in frontmatter if needed.
