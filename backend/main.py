# main.py
from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import Base, engine, get_db
import models, crud
from models import Slot, SwapRequest, SlotStatus, SwapStatus, User
from schemas import (
    SlotCreate,
    SlotOut,
    SwapRequestCreate,
    SwapResponse,
    SignupSchema,
    LoginSchema,
)
from auth import decode_access_token, create_access_token, verify_password
from datetime import datetime
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware

# ---- Setup ----
app = FastAPI(title="SlotSwapper")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*","http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)

# ---- Helpers ----
def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth scheme")

    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get(User, int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---- Auth ----
@app.post("/api/auth/signup")
def signup(u: SignupSchema, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, u.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    user = crud.create_user(db, u.name, u.email, u.password)
    return {"id": user.id, "name": user.name, "email": user.email}


@app.post("/api/auth/login")
def login(u: LoginSchema, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, u.email)
    if not user or not verify_password(u.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}


# ---- Slots ----
@app.post("/api/slots", response_model=SlotOut)
def create_slot(
    slot: SlotCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = Slot(
        title=slot.title,
        start_time=slot.start_time,
        end_time=slot.end_time,
        owner_id=current_user.id,
        status=SlotStatus.BUSY,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@app.get("/api/my-slots", response_model=List[SlotOut])
def my_slots(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Slot).filter(Slot.owner_id == current_user.id).all()


@app.patch("/api/slots/{slot_id}", response_model=SlotOut)
def update_slot_status(
    slot_id: int,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = db.get(Slot, slot_id)
    if not s:
        raise HTTPException(status_code=404, detail="Slot not found")
    if s.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your slot")

    new_status = payload.get("status")
    if new_status not in [e.value for e in SlotStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")

    s.status = SlotStatus(new_status)
    db.commit()
    db.refresh(s)
    return s


@app.get("/api/swappable-slots", response_model=List[SlotOut])
def swappable_slots(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Slot)
        .filter(
            Slot.status == SlotStatus.SWAPPABLE,
            Slot.owner_id != current_user.id,
        )
        .all()
    )

# ---- Swap ----
@app.post("/api/swap-request")
def create_swap(
    req: SwapRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # load slots
    my_slot = db.get(Slot, req.mySlotId)
    their_slot = db.get(Slot, req.theirSlotId)

    if not my_slot or not their_slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if my_slot.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="mySlotId not owned by you")
    if my_slot.owner_id == their_slot.owner_id:
        raise HTTPException(status_code=400, detail="Cannot swap with yourself")
    if my_slot.status != SlotStatus.SWAPPABLE or their_slot.status != SlotStatus.SWAPPABLE:
        raise HTTPException(status_code=400, detail="Both slots must be SWAPPABLE")

    try:
        # update statuses and create swap then commit once
        my_slot.status = SlotStatus.SWAP_PENDING
        their_slot.status = SlotStatus.SWAP_PENDING

        swap = SwapRequest(
            requester_id=current_user.id,
            responder_id=their_slot.owner_id,
            my_slot_id=my_slot.id,
            their_slot_id=their_slot.id,
            status=SwapStatus.PENDING,
        )
        db.add(swap)
        db.commit()
        db.refresh(swap)
    except Exception as e:
        # rollback and return clean error for frontend
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Could not create swap: {str(e)}")

    return {"requestId": swap.id, "status": swap.status.value}


@app.post("/api/swap-response/{request_id}")
def swap_response(
    request_id: int,
    body: SwapResponse,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    swap = db.get(SwapRequest, request_id)
    if not swap:
        raise HTTPException(status_code=404, detail="SwapRequest not found")
    if swap.responder_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    my_slot = db.get(Slot, swap.my_slot_id)
    their_slot = db.get(Slot, swap.their_slot_id)
    if not my_slot or not their_slot:
        # mark rejected and persist
        try:
            swap.status = SwapStatus.REJECTED
            db.commit()
        except Exception:
            db.rollback()
        raise HTTPException(status_code=400, detail="Slot missing")

    try:
        if body.accept:
            # swap owners and set BUSY
            tmp_owner = my_slot.owner_id
            my_slot.owner_id = their_slot.owner_id
            their_slot.owner_id = tmp_owner

            my_slot.status = SlotStatus.BUSY
            their_slot.status = SlotStatus.BUSY
            swap.status = SwapStatus.ACCEPTED

            db.commit()
            return {"status": "ACCEPTED"}
        else:
            # reject: reset statuses
            my_slot.status = SlotStatus.SWAPPABLE
            their_slot.status = SlotStatus.SWAPPABLE
            swap.status = SwapStatus.REJECTED

            db.commit()
            return {"status": "REJECTED"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Could not process response: {str(e)}")





@app.get("/api/my-swap-requests")
def my_swap_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sent = (
        db.query(SwapRequest)
        .filter(SwapRequest.requester_id == current_user.id)
        .all()
    )
    received = (
        db.query(SwapRequest)
        .filter(SwapRequest.responder_id == current_user.id)
        .all()
    )
    return {
        "sent": [
            {
                "id": s.id,
                "my_slot_id": s.my_slot_id,
                "their_slot_id": s.their_slot_id,
                "status": s.status.value,
                "username": db.get(User, s.responder_id).name,  # responder name
                "role": "sent",
            }
            for s in sent
        ],
        "received": [
            {
                "id": r.id,
                "my_slot_id": r.my_slot_id,
                "their_slot_id": r.their_slot_id,
                "status": r.status.value,
                "username": db.get(User, r.requester_id).name,  # requester name
                "role": "received",
            }
            for r in received
        ],
    }



@app.delete("/api/slots/{slot_id}")
def delete_slot(slot_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    slot = db.get(Slot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your slot")

    # Check for pending swaps
    active_swaps = db.query(SwapRequest).filter(
        ((SwapRequest.my_slot_id == slot.id) | (SwapRequest.their_slot_id == slot.id)) &
        (SwapRequest.status == SwapStatus.PENDING)
    ).count()
    if active_swaps > 0:
        raise HTTPException(status_code=400, detail="Cannot delete slot involved in pending swap")

    # Delete completed swaps related to this slot
    related_swaps = db.query(SwapRequest).filter(
        (SwapRequest.my_slot_id == slot.id) | (SwapRequest.their_slot_id == slot.id)
    ).all()
    for swap in related_swaps:
        db.delete(swap)

    db.delete(slot)
    db.commit()
    return {"detail": "Slot deleted"}


@app.get("/api/me")
def current_user(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}
