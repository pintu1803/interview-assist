from typing import Dict
from dataclasses import dataclass

@dataclass
class Chunk:
    text: str
    metadata: Dict