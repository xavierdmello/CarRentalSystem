from backend.schemas.user import UserCreate, UserLogin
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.model import User, Role
from backend.services.password import get_password_hash, verify_password
from backend.services.auth import create_jwt_token
import traceback

def print_detailed_exception(base_message):
    print(base_message)
    traceback.print_exc()

def register_user(user: UserCreate, db: Session):
        try:
            db_user = db.query(User).filter(User.email == user.email).first()
            if db_user:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
            
            # Validate role
            if user.role not in ["customer", "admin"]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

            hashed_password = get_password_hash(user.password)
            new_user = User(
                name=user.name,
                email=user.email,
                password_hash=hashed_password,
                phone_number=user.phone,
                address=user.address,
                role=Role(user.role)  # Convert string to Role enum
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            user_data = UserLogin(email=new_user.email, password=user.password)
            token_data = login_user(user_data, db=db)

            return token_data
        
        except HTTPException as ep:
            raise ep  
        except Exception as ep:
            print_detailed_exception(ep)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(ep))
        finally:
            db.close

def login_user(user: UserLogin, db: Session):
    user_db = db.query(User).filter(User.email == user.email).first()
    if not user_db or not verify_password(user.password, user_db.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_jwt_token(data={"sub": user_db.email, "user_id": user_db.user_id})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_db.user_id, "role": user_db.role, "email": user_db.email, "phone_number": user_db.phone_number,"name": user_db.name}




#Extra Features like editing profile,viewing profile, deleting profile, etc can be added here in the future.