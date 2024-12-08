from typing import Optional,List
from pydantic import BaseModel
from datetime import datetime

class CarGetResponse(BaseModel):
    car_id:int
    make: str
    model:str
    year: int
    registration_number: int
    status: str
    daily_rent : int
    image_url: str
    created_at: datetime
    category: str

class carFilterParams(BaseModel):
    category :Optional[str]=None
    make :Optional[str]=None
    model : Optional[str]=None
    year : Optional[int] =None

class CarResponse(BaseModel):
    status:int
    success : bool
    message: str
    data: List[CarGetResponse]

class CarResponseModel(BaseModel):
    status:int
    success : bool
    message: str
    data:CarGetResponse

class CarCreate(BaseModel):
    make: str
    model:str
    year: int
    registration_number: int
    status: str
    daily_rent : int
    image_url: str
    category: str

class CarBookRequest(BaseModel):
    car_id:int
    rental_date:datetime
    return_date:datetime
    




