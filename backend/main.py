from fastapi import FastAPI, status, Depends,HTTPException,Header
from backend.schemas.user import ResponseModel, UserCreate,UserLogin
from backend.schemas.car import CarResponse, carFilterParams,CarResponseModel,CarCreate,CarBookRequest
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.services import user_service
from backend.services import car_service
from backend.services import rental_service
from backend.services.auth import authenticated,get_current_user
from backend.model import Car
from typing import Optional

app = FastAPI()

@app.post("/signup/", status_code=status.HTTP_201_CREATED,response_model=ResponseModel)
def sign_up(user: UserCreate, db: Session = Depends(get_db)):
    registered_user = user_service.register_user(user, db)
    if not registered_user:
        raise HTTPException(status_code=400, detail="user not registered")
    return {"status":201,"success":True,"message":"User registered successfully","data":registered_user}

@app.post("/login/",response_model=ResponseModel)
def login_access_token(user:UserLogin, db: Session = Depends(get_db)):
    login = user_service.login_user(user, db)
    if not login:
        raise HTTPException(status_code=400, detail="Login failed")
    return {"status":200,"success":True,"message":"User logged in successfully","data":login}

@app.get("/view_cars/",response_model=CarResponse)
def get_car_list(
    category :Optional[str]=None,
    make :Optional[str]=None,
    model : Optional[str]=None,
    year : Optional[int] =None,
    db: Session = Depends(get_db)):

    filters = carFilterParams(
        category=category,
        make=make,
        model=model,
        year=year
    )
    cars_list = car_service.get_filtered_cars(filters, db)
    if not cars_list:
        raise HTTPException(status_code=400, detail="cars list not fetched")
    return {"status":200,"success":True,"message":"cars list fetched successfully","data":cars_list}

@app.get("/get_car/{car_id}", response_model=CarResponseModel)
def get_car(carId: int,db: Session = Depends(get_db)):
    car = car_service.get_car_by_id(carId, db)
    if not car:
        raise HTTPException(status_code=400, detail="car not fetched")
    return {"status":200,"success":True,"message":"car fetched successfully","data":car}

@app.post("/add_car/",response_model=CarResponseModel)
@authenticated(roles=["admin"])
def create_car(car:CarCreate,token:str = Header(),db: Session = Depends(get_db)):
    car_create=car_service.create_car(car, db)
    if not car_create:
        raise HTTPException(status_code=400, detail="car not created")
    return {"status":200,"success":True,"message":"car created successfully","data":car_create}

@app.post("/delete_car/{car_id}")
@authenticated(roles=["admin"])
def delete_car(car_id: int,token:str = Header(), db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.car_id == car_id).first()
    
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    db.delete(car)
    db.commit()
    return {"status":200,"success":True,"message":"car created successfully"}

@app.post("/book_car/")
def book_car(rental:CarBookRequest,token:str = Header(), db: Session = Depends(get_db)):
    user_id = get_current_user(token).user_id
    car_book=rental_service.book_car(rental,user_id, db)
    if not car_book:
        raise HTTPException(status_code=400, detail="car not booked")
    return {"status":200,"success":True,"message":"car booked successfully","data":car_book}