from app.config.settings import settings
from app.llm.base import LLM
from openai import OpenAI


class OpenAILLM(LLM):

    def __init__(self, api_key:str, model:str):
        self.model = model
        self.client = OpenAI(api_key=api_key)

    def generate(self, prompt:str)-> str:

        try:
            messages = []
            messages.append({"role": "Java Expert for Interview Preparation",
                             "content": prompt})
            
            response = self.client.chat.completions.create(
                            model=self.model,
                            messages=messages,
                            temperature=0.2
                        )

            if response.choices[0] is None:
                raise RuntimeError("OpenAI returned no text")
            return str(response.choices[0].message.content)
        except Exception as e:
            return "Model is unavailable"
