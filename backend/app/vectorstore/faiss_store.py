import faiss
import numpy as np

from app.vectorstore.base import VectorStore


class FAISSVectorStore(VectorStore):
    def __init__(self, dimension:int):
        self.dimension = dimension

        self.index = faiss.IndexFlatIP(dimension)

        #stores the text-chunk in memory instead of disk
        self.chunks = []

    def store(self, chunks, embeddings):
        vectors = np.array(embeddings).astype("float32")

        self.index.add(vectors)

        self.chunks.extend(chunks)      

    def search(self, query_vector, top_k = 5):
        query = np.array([query_vector]).astype("float32")

        scores, indices = self.index.search(query, top_k)  

        results = []

        for idx in indices[0]:
            results.append(
                self.chunks(idx)
            )

        return results