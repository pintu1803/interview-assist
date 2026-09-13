"""defines the document model, different data loaders will
return output in this document format only.
"""
from dataclasses import dataclass
from typing import Dict

@dataclass
class Document:
    content: str
    metadata: dict