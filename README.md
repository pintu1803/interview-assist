### 1. Data Flow - Every request will follow this flow.

                    User Question
                          │
                          ▼
                   API Endpoint
                          │
                          ▼
                   Chat Service
                          │
            ┌─────────────┴─────────────┐
            │                           │
     Retrieve Context             Build Prompt
            │                           │
            └─────────────┬─────────────┘
                          │
                          ▼
                    LLM Provider
                          │
                          ▼
                   Final Response

### 2. This will be broken down into modules.
```
                Chat Service

                      |

    ---------------------------------------

    |          |         |         |

Retriever   Prompt    LLM      Response

Builder    Builder   Provider   Formatter
```
**Each module has one responsibility.**

### 3. Define Responsibilities

<details>
<summary>Component Wise Responsibilities</summary>

API Layer: 
Only receives HTTP requests.
Receive JSON -> Validate -> Call ChatService -> Return JSON

Chat Service: 
This is the orchestrator. 
Question -> Retriever -> Prompt Builder -> LLM -> Formatter
It delegates all the moduler work to designated modules and get the overall work done.

Retriever: Fetch the top K relevant records/documents from the database.
option-A: Embedding -> FAISS -> Top K Chunks
option-B: Embedding -> Pinecone -> Reranker -> Top K Chunks

Orchestrator simply takes the parent type object (interface) and does not really know which DB we are using.

Prompt Builder: 
Input: Question + Retrieved Context
If we want to switch domain then only prompt changes and orchestrator remains unaffected.

LLM Provider: OpenAI, Claude, Ollama, anything.. 
Changes are only required in this module.

*Response Formatter: No matter what format the response is in from the LLM, we will change it to a common response format.*


</details>

### 4. Define Interfaces:
Every module should expose one interface.
EmbeddingProvide, LLMProvider, etc..

### 5. Configuration-Driven Design:
We will not change the modules inside the main orchestrator, instead, 
we will add them in a configuration file.

### 6. dependency injection -> take care from beginning itself.

<details>
<summary> Retriever Hides the internal mechanism of fetching chunks for given query</summary>
User Query
    |
    v
Retriever
    |
    +---- Embedding Model
    |
    +---- Vector Store
    |
    v
Relevant Chunks
</details>

### 7. Final architecture:
INGESTION - Offline
```
         Documents
            │
          Loader
            │
        Preprocessor
            │
         Chunker
            │
         Embedding
            │
         Indexer
            │
          FAISS
```

QUERY
```
         Question
            │
         Embedding
            │
         Retriever
            │
        Context Builder
            │
        Prompt Builder
            │
           LLM
            │
         Formatter
            │
         Response
```

### 8. Application Boot Sequence

*When FastAPI starts, what exactly should happen?*
```
        FastAPI Starts
            │
            ▼
        Read Configuration
            │
            ▼
        Initialize Logger
            │
            ▼
        Load Embedding Model
            │
            ▼
        Load Vector Index
            │
            ▼
        Create Retriever
            │
            ▼
        Create LLM Provider
            │
            ▼
        Create Chat Service
            │
            ▼
        Register API Routes
            │
            ▼
        Ready
```

**models are loaded only once, not on every request.**

Application Container: or: Dependency Injection Container
Configuration
Dependency Graph
Service Lifetime
Request Lifecycle
Error Flow
Health Checks

## Final Runtime Architecture:
```
                FastAPI

                    │

          --------------------

          │                  │

      Startup           HTTP Requests

          │                  │

     Load Services       API Layer

          │                  │

     Application        Chat Service

          │                  │

      Shared Objects     Retriever

                          │

                         LLM

                          │

                       Response
```     
### 9. Dir structure
We will create one dir for each replaceable module or package.
Strategy Pattern + Dependency Injection.

<details>
<summary>Dir structure</summary>
app/

├── llm/
│   |
│   ├── base.py
│   ├── gemini.py
│   └── ollama.py
│
├── embeddings/
│   |
│   ├── base.py
│   └── sentence_transformer.py
│
├── vectorstore/
│   |
│   ├── base.py
│   └── faiss_store.py
│
├── retrieval/
│   |
│   └── retriever.py
│
├── ingestion/
│   |
│   ├── loader.py
│   ├── chunker.py
│   └── indexer.py
│
├── prompts/
│   |
│   └── builder.py
│
├── services/
│   |
│   └── chat_service.py
│
└── container.py
</details>

directories structure for now:
---

```
interview-assis or app/
|
├── llm/
├── embeddings/
├── vectorstore/
├── loaders/
├── chunking/
├── retrieval/
├── reranking/
├── prompts/
├── search/
│
├── services/
│   └── chat_service.py
│
├── container.py
└── main.py
```

                 Java Interview Documents
                          │
                Chunking + Metadata
                          │
                  Embedding Model
                          │
                 Vector Database (HNSW)
                          │
                          │
────────────────────────────────────────────────────
                          │
                     User Question
                          │
                    Query Rewriter
                          │
          ┌───────────────┴────────────────┐
          ▼                                ▼
      BM25 Search                    Vector Search
          │                                │
          └───────────────┬────────────────┘
                          ▼
                  Candidate Documents
                          ▼
              Cross-Encoder Reranker
                          ▼
                 Top 5–10 Chunks
                          ▼
                         LLM
                          ▼
      Interview Answer + References + Follow-up Questions

Vercel
 |
React

Render|AWS Lambda
 |
FastAPI

Qdrant Cloud
 |
Vectors

Gemini API
 |
LLM

Built a serverless RAG-based Java interview assistant using AWS Lambda, S3, Qdrant vector search, and Gemini LLM APIs."