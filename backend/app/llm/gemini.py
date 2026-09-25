from app.llm.base import LLM
from google import genai
from app.config.settings import settings

class GeminiLLM(LLM):

    def __init__(self, api_key:str):
        self.client = genai.Client(api_key=api_key)

    def generate(self, prompt:str)-> str:

        try:
            response = self.client.models.generate_content(
                            model=settings.gemini_model,
                            contents=prompt,
                        )

            if response.text is None:
                raise RuntimeError("Gemini returned no text")
            return response.text
        except Exception as e:
            return "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later."

# command to run
# python -m app.llm.gemini

# client = genai.Client(api_key=settings.gemini_api_key)

# response = client.models.generate_content(
#                 model=settings.gemini_model,
#                 contents="hello google! describe main componenets of kafka",
#             )

# print("Response = ", response.text)