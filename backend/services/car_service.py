from backend.schemas.car import carFilterParams, CarCreate
from backend.model import Car
from sqlalchemy.orm import Session
from fastapi import HTTPException,status

def get_filtered_cars(filters: carFilterParams, db: Session):
    try:
        query = db.query(Car).filter(Car.status=="available")
        
        if filters.make:
            query = query.filter(Car.make == filters.make)

        if filters.model:
            query = query.filter(Car.model == filters.model)    
        
        if filters.year:
            query = query.filter(Car.year == filters.year)
        
        if filters.category:
            query = query.filter(Car.category == filters.category)
        
        cars = query.all()
        return cars
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving the cars: {str(e)}"
        )
    
def get_car_by_id(carId: int, db: Session):
    try:
        db_car = db.query(Car).filter(Car.car_id == carId).first()
        if not db_car:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Car with ID {carId} not found"
        )
        return db_car
    except HTTPException as ep:
        raise ep
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving the car: {str(e)}")
    
def create_car(car: CarCreate, db: Session):
    try:
        db_car = Car(
            make = car.make,
            model= car.model,
            year= car.year,
            registration_number= car.registration_number,
            status= car.status,
            daily_rent = car.daily_rent,
            image_url= car.image_url,
            category= car.category
        )
        db.add(db_car)
        db.commit()
        db.refresh(db_car)
        return db_car
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the car: {str(e)}"
        )
    finally:
        db.close()

