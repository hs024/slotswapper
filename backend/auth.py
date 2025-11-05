from datetime import datetime, timedelta
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET", "testsecret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))


def hash_password(password: str) -> str:
    # store as plain text (test only)
    return password


def verify_password(plain: str, stored: str) -> bool:
    return plain == stored


def create_access_token(data: dict, expires_delta: int = ACCESS_EXPIRE_MIN):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
