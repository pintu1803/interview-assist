
from abc import ABC, abstractmethod
from typing import List
from app.models.document import Document

class DocumentLoader(ABC):
    """The load method returns a list of documents.
    Because the interface must be compatible for all implementing classes.
    pdf file contains multiple pages when read, so that is the special case.
    Other files mainly read the whole content as one page - of any length."""
    @abstractmethod
    def load(self, path: str) -> List[Document]:
        pass