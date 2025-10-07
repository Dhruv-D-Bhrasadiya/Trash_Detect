from pydantic import BaseModel
from typing import List, Optional

class DetectionBase(BaseModel):
    label: str
    confidence: float
    xmin: float
    ymin: float
    xmax: float
    ymax: float

class DetectionCreate(DetectionBase):
    pass

class Detection(DetectionBase):
    id: int
    submission_id: int

    class Config:
        orm_mode = True

class SubmissionBase(BaseModel):
    image_path: str
    score: int

class SubmissionCreate(SubmissionBase):
    pass

class Submission(SubmissionBase):
    id: int
    owner_id: int
    detections: List[Detection] = []

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    points: int
    is_active: bool
    is_superuser: bool
    submissions: List[Submission] = []

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
