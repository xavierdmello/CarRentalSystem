from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, Header
from functools import wraps
from backend.db import get_db
from fastapi import HTTPException, Header, status
from backend.model import User,Role
import traceback


SECRET_KEY = "fgdshioeuydfhwuigfyt!@#!$@$fhyfghyuwrfwfwfsfhgsy"
ALGORITHM = "HS256"


def print_detailed_exception(base_message):
    print(base_message)
    traceback.print_exc()

def create_jwt_token(data: dict, token_expiration_time:Optional[int] = 24 * 60) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=token_expiration_time)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_jwt_token(token: str = Header(...)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
def get_current_user(token: str):
    db = next(get_db())
     
    payload = verify_jwt_token(token)
    user_id: int = payload.get("user_id")
    user = db.query(User).filter(User.user_id== user_id).first()
    return user
    
def authenticated(roles=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            token = kwargs.get("token")
            try:
                payload = verify_jwt_token(token)
                if not payload or ('user_id' not in payload and 'email' not in payload):
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

                if roles:
                    db = next(get_db())
                    user_id = payload['user_id']
                    user = db.query(User).filter(User.user_id == user_id).first()
                    if user is None or user.role not in [Role(role) for role in roles]:
                        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Permission denied for {user.role } role")

                return func(*args, **kwargs)  
            except HTTPException as e:
                raise e
            except Exception as ep:
                print_detailed_exception(ep)
                print("Detailed exception:", ep)
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")
        return wrapper
    return decorator