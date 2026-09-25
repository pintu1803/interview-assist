from app.config.settings import settings
from app.llm.base import LLM
from openai import OpenAI

GROQ_BASE_URL = "https://api.groq.com/openai/v1"

class GroqLLM(LLM):

    def __init__(self, api_key:str):
        self.client = OpenAI(api_key=api_key,
                             base_url=GROQ_BASE_URL)

    def generate(self, prompt:str)-> str:

        try:           
            response = self.client.chat.completions.create(
                            model=settings.groq_model,
                            messages=[
                                        {
                                            "role": "system",
                                            "content": """
                                            You are a Java backend interview assistant.
                                            Use the retrieved context.
                                            Explain concepts with examples.
                                            """
                                        },
                                        {
                                            "role": "user",
                                            "content": prompt
                                        }
                                    ],
                            temperature=0.2
                        )
            content = response.choices[0].message.content if response.choices else None 
            if not content:
                raise RuntimeError("Groq returned no text")
            return str(content)
        
        except Exception as e:
            print("GroqLLM generate failed: %s", e)
            return "Model is unavailable"
