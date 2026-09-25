from app.retriever.base import Retriever
from app.prompts.base import PromptBuilder
from app.llm.base import LLM
from typing import List
from app.config.types import RetrievedChunk
from app.llm.fallback_llm import Fallback_LLM

class RAGService():
    def __init__(self, retriever:Retriever, 
                 prompt_builder: PromptBuilder, 
                 llm: Fallback_LLM):
        self.retriever = retriever
        self.prompt_builder = prompt_builder
        self.llm = llm


        
    def ask(self, query:str):
        retrieved_chunks = self.retriever.retrieve(query)
        # print("Show me the retrieved chunks : ", retrieved_chunks)

        prompt = self.prompt_builder.build(query, retrieved_chunks)
        # print("Show me the prompt : ", prompt)

        response = self.llm.generate(prompt)

        return response
