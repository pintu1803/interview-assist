
from app.loaders.base import DocumentLoader
from app.models.document import Document

class MarkDownLoader(DocumentLoader):

    def load(self, path: str):

        doc_path = path(path)

        if not doc_path.exists():
            raise FileNotFoundError(f"Markdown file not found : {path}")

        if doc_path.suffix.lower() != ".md":
            raise ValueError(f"File is not markdown file")

        content = doc_path.read_text(encoding="utf-8")

        metadata = {
            "parent": path,
            "type": "markdown",
            "filepath": doc_path.name
        }

        return [Document(
            content=content,
            metadata=metadata
        )]