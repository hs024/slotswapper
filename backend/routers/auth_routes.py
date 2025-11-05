# routers/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserCreate, Token, UserOut
from crud import get_user_by_email, create_user
from auth import verify_password, create_access_token
from models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=UserOut)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email exists")
    u = create_user(db, data.name, data.email, data.password)
    return u

@router.post("/login", response_model=Token)
def login(form: UserCreate, db: Session = Depends(get_db)):
    user = get_user_by_email(db, form.email)
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}
