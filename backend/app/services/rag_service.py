from app.retriever.base import Retriever
from app.prompts.base import PromptBuilder
from app.llm.base import LLM

class RAGService():
    def __init__(self, retriever:Retriever, 
                 prompt_builder: PromptBuilder, 
                 llm: LLM):
        self.retriever = retriever
        self.prompt_builder = prompt_builder
        self.llm = llm


        
    def ask(self, query:str):
        chunks = self.retriever.retrieve(query)

        prompt = self.prompt_builder.build(query, chunks)

        response = self.llm.generate(prompt)

        return response
