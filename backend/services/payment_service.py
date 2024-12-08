from backend.schemas.payment import PaymentAdd
from sqlalchemy.orm import Session
from backend.model import Payment
from datetime import datetime
from fastapi import HTTPException,status
import traceback

def print_detailed_exception(base_message):
    print(base_message)
    traceback.print_exc()

def add_payment(pay: PaymentAdd, db: Session):
        try:
            new_payment = Payment(
                rental_id=pay.rental_id,
                amount=pay.amount,
                payment_date=datetime.now(),
                payment_method=pay.payment_method,
            )
            db.add(new_payment)
            db.commit()
            db.refresh(new_payment)

            return new_payment
        except HTTPException as ep:
            raise ep  
        except Exception as ep:
            print_detailed_exception(ep)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(ep))
        finally:
            db.close

def get_payments(db:Session):
    try:
        payments = db.query(Payment).all()
        return payments
    except HTTPException as ep:
        raise ep
    except Exception as ep:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(ep))
    finally:
        db.close()