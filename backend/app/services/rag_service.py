from app.retriever.base import Retriever
from app.prompts.base import PromptBuilder
from app.llm.fallback_llm import Fallback_LLM
from app.reranking.base import ReRanker
from app.config.settings import settings

class RAGService():
    def __init__(self, retriever:Retriever, 
                 reranker: ReRanker,
                 prompt_builder: PromptBuilder, 
                 llm: Fallback_LLM):
        self.retriever = retriever
        self.reranker = reranker
        self.prompt_builder = prompt_builder
        self.llm = llm


        
    def ask(self, query:str):
        chunks = self.retriever.retrieve(query, settings.topk)
        # print("Show me the retrieved chunks : ", retrieved_chunks)

        #reranker gives top K chunks
        retrieved_chunks = self.reranker.rerank(query=query, retrieved_chunks=chunks, top_k=settings.rerank_topk)

        prompt = self.prompt_builder.build(query, retrieved_chunks)
        # print("Show me the prompt : ", prompt)

        response = self.llm.generate(prompt)

        return response
