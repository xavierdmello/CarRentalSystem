from pydantic import BaseModel
from datetime import datetime

class UserGet(BaseModel):
    user_id: int
    name : str
    role: str
    email: str
    phone_number: str 
    access_token: str
    token_type: str

class ResponseModel(BaseModel):
    status:int
    success:bool
    message:str
    data:UserGet
    
class UserCreate(BaseModel):
    email: str
    name: str
    address: str
    password: str
    phone: str

class UserLogin(BaseModel):
    email: str
    password: str