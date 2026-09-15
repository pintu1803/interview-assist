from app.llm.base import LLM
from google import generativeai as genai

class GeminiLLM(LLM):

    def __init__(self, api_key:str):
        genai.configure(api_key=api_key)

        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def generate(self, prompt:str)-> str:
        response = self.model.generate_content(prompt)
        print("Type of the llm response : ", type(response))
        return response.text
        