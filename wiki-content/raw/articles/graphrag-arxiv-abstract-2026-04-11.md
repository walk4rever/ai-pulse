# GraphRAG ArXiv Abstract Capture

- Source: https://arxiv.org/abs/2404.16130
- Captured: 2026-04-11
- Title: From Local to Global: A Graph RAG Approach to Query-Focused Summarization

## Abstract
Retrieval-augmented generation (RAG) can retrieve relevant information from an external knowledge source so LLMs can answer questions over private and/or previously unseen document collections. However, RAG fails on global questions directed at an entire text corpus, since that is a query-focused summarization task rather than an explicit retrieval task. To combine the strengths of these contrasting methods, GraphRAG proposes a graph-based approach to question answering over private text corpora that scales with both the generality of user questions and the quantity of source text. It uses an LLM to build a graph index in two stages: first, derive an entity knowledge graph from the source documents; then pregenerate community summaries for groups of closely related entities. Given a question, each community summary generates a partial response, and the partial responses are summarized into a final response. For global sensemaking questions over datasets in the 1 million token range, GraphRAG shows substantial improvements over a conventional RAG baseline in comprehensiveness and diversity.
