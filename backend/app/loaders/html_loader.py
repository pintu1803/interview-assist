from pathlib import Path
from typing import List

from bs4 import BeautifulSoup

from app.loaders.base import DocumentLoader
from app.models.document import Document


class HTMLLoader(DocumentLoader):

    def load(
        self,
        path: str
    ) -> List[Document]:

        file_path = Path(path)

        if not file_path.exists():
            raise FileNotFoundError(
                f"HTML file not found: {path}"
            )

        if file_path.suffix.lower() not in [
            ".html",
            ".htm"
        ]:
            raise ValueError(
                "File is not an HTML file"
            )


        html_content = file_path.read_text(
            encoding="utf-8"
        )


        soup = BeautifulSoup(
            html_content,
            "html.parser"
        )


        text = soup.get_text(
            separator="\n"
        )


        metadata = {
            "source": str(file_path),
            "type": "html",
            "filename": file_path.name
        }


        return [
            Document(
                content=text,
                metadata=metadata
            )
        ]