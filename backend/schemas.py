from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PromptBase(BaseModel):
    title: str
    content: str
    tags: Optional[str] = None
    use_case: Optional[str] = None


class PromptCreate(PromptBase):
    pass


class PromptResponse(PromptBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
