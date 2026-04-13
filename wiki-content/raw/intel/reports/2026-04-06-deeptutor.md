# DeepTutor：Agent-Native 个性化学习助手

**更新日期**：2026年4月4日  
**GitHub**：HKUDS/DeepTutor (11.4k ⭐)  
**许可证**：Apache-2.0

## 入选理由

DeepTutor 是首个专为 Agent 设计的个性化学习助手，采用双层插件模型（Tools + Capabilities），将 RAG、多 Agent 协作、持久记忆等能力集成到一个完整的 CLI/SDK 解决方案中。今日刚发布 v1.0.0-beta.1 更新，代表了 AI 教育助手的最新方向。

## 核心架构

### 双层插件模型

1. **Tools 层**：RAG 检索、代码执行、Web 搜索、学术论文搜索、深度推理、脑暴
2. **Capabilities 层**：可扩展的能力定义，支持自定义技能

### 关键组件

| 组件 | 功能描述 |
|------|----------|
| **TutorBot** | 多渠道 bot 代理，支持 WebSocket 实时交互 |
| **Co-Writer** | 协作写作辅助 |
| **Guided Learning** | 引导式学习路径 |
| **Persistent Memory** | 持久记忆系统，跨会话学习 |
| **Heartbeat** | 主动心跳系统，周期性学习检查和提醒 |

## 深度分析

### 创新设计

1. **Soul 概念**：每个 bot 有独特的"灵魂"，塑造响应风格
2. **独立工作空间**：每个 bot 拥有独立目录（memory、sessions、skills、配置）
3. **共享知识层**：bot 间可访问 DeepTutor 的共享知识库
4. **主动心跳**：定时学习检查、复习提醒、计划任务
5. **技能学习**：支持向 bot 添加自定义 skill 文件

### 技术栈

- **框架**：Electron 40 + React 18 + TypeScript
- **构建**：Vite 5
- **AI 引擎**：OpenClaw（主要）
- **存储**：SQLite (sql.js)
- **状态管理**：Redux Toolkit

### 多提供商支持

支持 LLM 和 embedding 的多提供商接入，包括：
- OpenAI
- Anthropic
- Google
- Azure OpenAI
- 本地模型

### RAG 管道

- 支持 Docling（PDF 解析）
- 灵活的 RAG 管道导入
- 按知识库选择 RAG 管道

## 版本历史（2026）

| 版本 | 更新内容 |
|------|----------|
| v1.0.0-beta.1 | 最新版本（2026.04.04） |
| v0.6.0 | 会话持久化、增量文档上传、完整中文本地化 |
| v0.5.2 | Docling 支持 RAG-Anything |
| v0.5.0 | 统一服务配置、RAG 管道选择、侧边栏定制 |

## 应用场景

1. **个性化学习辅导**：根据学习者水平动态调整
2. **协作写作**：Co-Writer 支持多轮迭代
3. **代码教学**：结合 RAG 和代码执行
4. **学术研究**：论文搜索 + 深度推理

## 参考链接

- [GitHub 仓库](https://github.com/HKUDS/DeepTutor)
- [Apache-2.0 许可证](https://opensource.org/licenses/Apache-2.0)