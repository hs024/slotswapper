# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from models import SlotStatus, SwapStatus

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    class Config:
        from_attributes = True
class SlotCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime

class SlotOut(BaseModel):
    id: int
    title: str
    start_time: datetime
    end_time: datetime
    status: SlotStatus
    owner_id: int
    class Config:
        from_attributes = True

class SwapRequestCreate(BaseModel):
    mySlotId: int
    theirSlotId: int

class SwapResponse(BaseModel):
    accept: bool
class SignupSchema(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str
