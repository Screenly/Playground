from pydantic import BaseModel
from typing import List, Dict

class TillStatus(BaseModel):
    till_id: str
    is_available: bool
    seconds_remaining: int = 0

class DisplayStatus(BaseModel):
    available_tills: List[str]
    busy_tills: Dict[str, int]  # till_id -> seconds remaining

class TillUpdate(BaseModel):
    busy_duration: int  # Duration in seconds for how long the till will be busy