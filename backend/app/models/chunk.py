from dataclasses import dataclass
from app.config.types import ChunkMetadata

@dataclass
class Chunk:
    text: str
    metadata: ChunkMetadata