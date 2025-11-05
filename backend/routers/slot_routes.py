# routers/slot_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import SlotCreate, SlotOut
from models import Slot, SlotStatus, User
from auth import decode_access_token
from typing import List
import os

router = APIRouter(prefix="/api/slots", tags=["slots"])

def get_current_user(db: Session, token: str):
    payload = decode_access_token(token)
    if not payload: return None
    user_id = int(payload.get("sub"))
    return db.query(User).get(user_id)

def bearer_user(token_header: str = Depends(lambda: None)):
    # dependency implemented per-route where needed.
    return token_header

@router.post("/", response_model=SlotOut)
def create_slot(slot: SlotCreate, token: str = Depends(), db: Session = Depends(get_db)):
    # token comes from Depends in FastAPI but simpler to read Authorization header in production
    raise HTTPException(status_code=400, detail="Use Authorization: Bearer <token>")
