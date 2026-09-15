
from app.embeddings.base import EmbeddingModel
from typing import List
from sentence_transformers import SentenceTransformer

class SentenceTransformerEmbedding(EmbeddingModel):
    """
    Significance of encode:
    encode breaks text into tokens, converts each token into embedding vector.
    Pools all those vectors and finally produces one vector for whole sentence
    
    Significance of normalization:
    the final embedding vector will be stored in vector database.
    to search and fetch from database, cosine similarity is used,
    normalize vecotors have magnitude = 1, so cosine similarity becomes faster.
    """
    def __init__(self, model_name, cache_folder):
        self.model = SentenceTransformer(model_name_or_path=model_name, cache_folder=cache_folder)
        

    def embed(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, 
                                       normalize_embeddings=True)
        return embeddings.tolist()

        