# GraphRAG Docs Home Capture

- Source: https://microsoft.github.io/graphrag/
- Captured: {D}

## Extracted text
GraphRAG is a structured, hierarchical approach to Retrieval Augmented Generation (RAG), as opposed to naive semantic-search approaches using plain text snippets. The GraphRAG process involves extracting a knowledge graph out of raw text, building a community hierarchy, generating summaries for these communities, and then leveraging these structures when performing RAG-based tasks.

Retrieval-Augmented Generation (RAG) is a technique to improve LLM outputs using real-world information. Baseline RAG uses vector similarity as the search technique. GraphRAG uses knowledge graphs to provide substantial improvements in question-and-answer performance when reasoning about complex information.

Index steps:
1. Slice up an input corpus into TextUnits.
2. Extract entities, relationships, and key claims.
3. Perform hierarchical clustering with the Leiden technique.
4. Generate summaries of each community and its constituents from the bottom-up.

Query modes:
- Global Search: holistic questions about the corpus using community summaries.
- Local Search: specific entities by fanning out to neighbors and associated concepts.
- DRIFT Search: local search with added community context.
- Basic Search: baseline top-k vector search.
