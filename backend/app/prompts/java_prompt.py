from app.prompts.base import PromptBuilder
from app.models.chunk import Chunk
from app.config.types import RetrievedChunk

from typing import List


class JavaPrompt(PromptBuilder):

    def build(self, question:str, chunks:RetrievedChunk):
        context = "\n\n".join(text for text in chunks["documents"])

        prompt = f"""You are a Java Interview Assistant.
        Answer the question below only using the provided context
        
        Context:
        -------------------
        {context}
        -------------------

        Question:
        {question}

        Answer:
        """

        return prompt
        
        