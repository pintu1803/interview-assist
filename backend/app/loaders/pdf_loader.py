from pathlib import Path
from typing import List

from app.models.document import Document
from app.loaders.base import DocumentLoader

from pypdf import PdfReader


class PDFLoader(DocumentLoader):

    def load(self, path: str) -> List[Document]:

        file_path = Path(path).resolve()

        reader = PdfReader(file_path)

        documents = []

        for page in reader.pages:
            text = page.extract_text()

            if text:
                documents.append(
                    Document(
                    content=text,
                        metadata={
                            "source": str(file_path),
                            "type": "pdf"
                        }
                    )
                )
        return documents