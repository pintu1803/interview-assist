from app.llm.base import LLM
from google import genai
from app.config.settings import settings

class GeminiLLM(LLM):

    def __init__(self, api_key:str):
        genai.configure(api_key=api_key)

        self.client = genai.Client(api_key=settings.gemini_api_key   )

    def generate(self, prompt:str)-> str:
        response = self.client.models.generate_content(
                        model=settings.gemini_model,
                        contents="hello google",
                    )

        return response.text



client = genai.Client(api_key=settings.gemini_api_key)

response = client.models.generate_content(
                model=settings.gemini_model,
                contents="hello google",
            )

print("Response = ", response.text)