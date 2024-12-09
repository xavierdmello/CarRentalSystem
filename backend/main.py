from fastapi import FastAPI, status, Depends,HTTPException,Header
from fastapi.middleware.cors import CORSMiddleware
from backend.schemas.user import ResponseModel, UserCreate,UserLogin
from backend.schemas.car import CarResponse, carFilterParams,CarResponseModel,CarCreate,CarBookRequest
from backend.schemas.payment import PaymentAdd
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.services import user_service
from backend.services import car_service
from backend.services import rental_service
from backend.services import payment_service
from backend.services.auth import authenticated,get_current_user
from backend.model import Car
from typing import Optional

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/book_rental/")
def book_car(rental:CarBookRequest,token:str = Header(), db: Session = Depends(get_db)):
    user_id = get_current_user(token).user_id
    car_book=rental_service.book_car(rental,user_id, db)
    if not car_book:
        raise HTTPException(status_code=400, detail="car not booked")
    return {"status":200,"success":True,"message":"car booked successfully","data":car_book}

@app.get("/ongoing_rentals/")
@authenticated(roles=["admin"])
def get_ongoing_rentals(token:str = Header(),db: Session = Depends(get_db)):
    rentals = rental_service.get_ongoing_rentals(db)
    if not rentals:
        raise HTTPException(status_code=400, detail="rentals not fetched")
    return {"status":200,"success":True,"message":"Rentals fetched successfully","data":rentals}

@app.put("/car_return/")
@authenticated(roles=["admin"])
def car_return(rental_id:int, token: str = Header(), db: Session = Depends(get_db)):    
    return_rental =  rental_service.return_rental(rental_id, db)
    if not return_rental:
        raise HTTPException(status_code=400, detail="Return not placed")
    
    return {
        "status": 200,
        "success": True,
        "message": "Rental returned successfully",
        "data": return_rental
    }

@app.post("/add_payment/", status_code=status.HTTP_201_CREATED)
def add_payment(pay: PaymentAdd, db: Session = Depends(get_db)):
    payment = payment_service.add_payment(pay, db)
    if not payment:
        raise HTTPException(status_code=400, detail="Payment not found")
    return {"status":201,"success":True,"message":"Payment added successfully","data":payment}

@app.get("/get_payments/")
@authenticated(roles=["admin"])
def get_payments(token:str = Header(),db: Session = Depends(get_db)):
    payments = payment_service.get_payments(db)
    if not payments:
        raise HTTPException(status_code=400, detail="rentals not fetched")
    return {"status":200,"success":True,"message":"Payments fetched successfully","data":payments}

@app.get("/me/")
def get_current_user_data(token: str = Header()):
    try:
        user = get_current_user(token)
        return {
            "success": True,
            "data": {
                "user_id": user.user_id,
                "role": user.role.value,
                "email": user.email,
                "phone_number": user.phone_number,
                "name": user.name
            }
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")