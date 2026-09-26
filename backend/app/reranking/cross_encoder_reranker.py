from app.reranking.base import ReRanker
from app.config.types import RetrievedChunk
from sentence_transformers import CrossEncoder

class CrossEncoderReranker(ReRanker):
    def __init__(self, modelname):
        self.model_name = modelname
        self.model = CrossEncoder(self.model_name)

    def rerank(self, query:str, 
               retrieved_chunks:RetrievedChunk, 
               top_k:int) -> RetrievedChunk:
        
        #fetch documents from retrieved chunks
        documents = retrieved_chunks["documents"]

        #pair all docs with query
        pairs = [(query, doc) for doc in documents]

        #calculate similarity score
        scores = self.model.predict(pairs)

        #rerank assign
        reranked_indices = sorted(range(len(scores)),
                                  key=lambda i: scores[i],
                                  reverse=True)

        #pick the highest score top_k indices
        selected_indices = reranked_indices[:top_k]

        #return the top_k in RetrievedChunk dataclass format
        return {
            "documents": [documents[i] for i in selected_indices],
            "distances": [retrieved_chunks["distances"][i] for i in selected_indices],
            "metadatas": [retrieved_chunks["metadatas"][i] for i in selected_indices]
        }



        