from sqlalchemy.orm import Session
from models import User, Slot, SwapRequest
from datetime import datetime

def create_user(db: Session, name: str, email: str, password: str):
    u = User(name=name, email=email, password_hash=password)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user(db: Session, user_id: int):
    return db.query(User).get(user_id)


def create_slot(db: Session, owner_id: int, title: str, start_time: datetime, end_time: datetime):
    s = Slot(owner_id=owner_id, title=title, start_time=start_time, end_time=end_time)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


def get_slots_for_user(db: Session, user_id: int):
    return db.query(Slot).filter(Slot.owner_id == user_id).all()


def get_swappable_slots(db: Session, user_id: int):
    return db.query(Slot).filter(
        Slot.status == Slot.__table__.c.status.type.enum_class.SWAPPABLE,
        Slot.owner_id != user_id
    ).all()
