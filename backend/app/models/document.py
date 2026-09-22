"""defines the document model, different data loaders will
return output in this document format only.
"""
from dataclasses import dataclass
from typing import TypedDict

@dataclass
class DocumentMetadata(TypedDict):
    source: str
    type: str

@dataclass
class Document:
    content: str
    metadata: DocumentMetadata