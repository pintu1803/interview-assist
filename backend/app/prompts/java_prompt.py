from app.prompts.base import PromptBuilder
from app.models.chunk import Chunk

from typing import List


class JavaPrompt(PromptBuilder):

    def build(self, question:str, chunks:List[Chunk]):
        context = "\n\n".join(chunk.text for chunk in chunks)

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
        
        