# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from database import Base
import enum
import datetime

class SlotStatus(str, enum.Enum):
    BUSY = "BUSY"
    SWAPPABLE = "SWAPPABLE"
    SWAP_PENDING = "SWAP_PENDING"

class SwapStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
# models.py (fix relationships)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    slots = relationship("Slot", backref="owner", cascade="all, delete-orphan")
    requests_sent = relationship("SwapRequest", foreign_keys="SwapRequest.requester_id", backref="requester")
    requests_received = relationship("SwapRequest", foreign_keys="SwapRequest.responder_id", backref="responder")


class Slot(Base):
    __tablename__ = "slots"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(Enum(SlotStatus), nullable=False, default=SlotStatus.BUSY)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    outgoing_swaps = relationship("SwapRequest", foreign_keys="SwapRequest.my_slot_id", backref="my_slot")
    incoming_swaps = relationship("SwapRequest", foreign_keys="SwapRequest.their_slot_id", backref="their_slot")


class SwapRequest(Base):
    __tablename__ = "swap_requests"
    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    responder_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    my_slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False)
    their_slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False)
    status = Column(Enum(SwapStatus), nullable=False, default=SwapStatus.PENDING)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
