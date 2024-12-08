from sqlalchemy.orm import Session
from backend.model import Rental,Car
from backend.schemas.car import CarBookRequest
from fastapi import HTTPException,status

def book_car(rental: CarBookRequest, user_id:int, db: Session):
    car = db.query(Car).filter(Car.car_id == rental.car_id).first()
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found"
        )
    rental_days = (rental.return_date - rental.rental_date).days
    if rental_days <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return date must be after rental date"
        )
    cost = car.daily_rent * rental_days
    try:
        db_rental = Rental(
            user_id = user_id,
            car_id = rental.car_id,
            rental_date = rental.rental_date,
            return_date = rental.return_date,
            total_cost = cost,
            status= "ongoing")
        
        db.add(db_rental)
        db.commit()
        db.refresh(db_rental)
        return db_rental
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the car: {str(e)}"
        )
    finally:
        db.close()

def get_ongoing_rentals(db:Session):
    try:
        rentals = db.query(Rental).filter(Rental.status == "ongoing").all()
        return rentals
    except HTTPException as ep:
        raise ep
    except Exception as ep:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(ep))
    finally:
        db.close()

def return_rental(rental_id:int, db: Session):
    try:
        return_rental = db.query(Rental).filter(Rental.rental_id == rental_id).first()
        if not return_rental:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rental not found")
        
        return_rental.status = "completed"
        

        db.commit()
        db.refresh(return_rental)

        return return_rental
    except HTTPException as ep:
        raise ep
    except Exception as ep:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(ep))
    