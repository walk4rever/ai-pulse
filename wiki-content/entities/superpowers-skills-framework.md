---
title: Superpowers Skills Framework
created: 2026-04-13
updated: 2026-04-13
type: entity
tags: [research, entity, agent, workflow]
sources: [raw/intel/reports/projects/2026-04-13-superpowers-framework.md]
---

# Superpowers Skills Framework

Superpowers Skills Framework 是一个面向 Claude Code / coding agent 生态的 Markdown 技能框架，核心思路是把可组合技能写成结构化文档，让 agent 在执行时遵守更明确的工程约束。

## 关键信息
- 在情报里，它被视为 Claude Code 生态里非常受欢迎的插件 / 技能框架。
- 它强调以 Markdown 形式组织能力，并把工程实践（尤其是 TDD）前置成默认行为。
- 它代表的是一种从“自由发挥型 agent”转向“结构化方法论”的路线。
- 详细报告给出的更强信号是：它不是单纯的“提示词包”，而是把 Brainstorm → Plan → Implement → Review → Finish 固化成一套默认工作流。
- 报告还强调了技能可自举：agent 可以从书籍/材料里提取新的技能，形成持续演化的知识闭环。
- 其生态扩张已经不局限于 Claude Code 单点，而是向多平台 agent 工作流扩展。

## 这类框架的意义
1. 它把 agent 工作流从 prompt 技巧，推进到可复用的技能组织方式。
2. 它强调结构化、可组合、可维护，这和长期工程化实践一致。
3. 它可作为后续整理其它 agent skill / harness 设计的参照物。

## 为什么值得记
- 它把“技能”从说明文档变成了可执行的方法论。
- 它和 [[hermes]] 这类 agent orchestration 设计形成了可对照的工作流范式。
- 它是后续比较不同 agent skill 框架时的一个很好的基线。

## 相关页面
- [[hermes]]
- [[agent-browser]]
- [[qwen-3-6-plus]]
