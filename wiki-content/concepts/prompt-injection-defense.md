---
title: Prompt Injection Defense
created: 2026-04-13
updated: 2026-04-13
type: concept
tags: [research, concept, security, agent]
sources: [raw/intel/reports/papers/2026-04-13-prompt-injection-defense.md, raw/intel/reports/papers/2026-04-13-prompt-injection-defense-deep.md]
---

# Prompt Injection Defense

Prompt Injection Defense 指的是围绕 LLM / Agent 系统的提示词注入防护方法。当前这类研究的重点已经不是“简单过滤关键词”，而是把威胁建模、数据合成、指令级学习和系统级防御一起纳入设计。

## 这份情报里强调了什么
- 研究区分了三类威胁：行为偏离、隐私泄露、恶意输出。
- 提出了 `DIVERSE` 数据合成方法，用于生成更丰富的防御训练样本。
- 引入 `ICTL`（instruction-level chain-of-thought learning）一类思路，把防御能力上升到指令级学习。
- 深度报告给出的实验结果更具体：DIVERSE + ICTL 在三个威胁场景上的平均防御成功率达到 72.3%，并且在对抗迭代攻击下衰减更慢。
- 结论是：随着 Agent 走向真实部署，提示词注入已经成为企业级系统里不能回避的首要安全问题之一。

## 核心判断
- 这类防御问题不是模型越大就越能自动解决。
- 更重要的是任务切分、威胁边界、评测设计和执行约束。
- 在 Agent 系统里，安全防护应当和工作流设计一起做，而不是事后补丁。

## 进一步的工程含义
- 防御方法正在从“关键词过滤”转向“威胁建模 + 数据合成 + 指令级学习”。
- 这类研究更像系统工程，而不是单一模型技巧。
- 对实际 Agent 产品来说，安全链路应在输入、上下文、工具调用和输出四个层次一起设计。

## 相关页面
- [[2026-04-13-anthropic-project-glasswing]]
- [[hermes]]
