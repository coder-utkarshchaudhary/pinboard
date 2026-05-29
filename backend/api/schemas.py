from __future__ import annotations
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel


class CardOut(BaseModel):
    id: str
    kind: Literal["text", "file"]
    content: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    priority: str
    priority_rank: int
    status: Literal["todo", "done"]
    created_at: datetime
    due_at: datetime
    completed_at: Optional[datetime] = None


class CardUpdate(BaseModel):
    content: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[Literal["todo", "done"]] = None
