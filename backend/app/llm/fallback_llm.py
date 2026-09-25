
class Fallback_LLM:
    def __init__(self, providers):
        self.providers = providers

    def generate(self, prompt):
        last_exception = None

        #loop over all providers until one serves the request
        for provider in self.providers:
            try:
                return provider.generate(prompt)
            except Exception as e:
                last_exception = e
        raise BaseException(last_exception)