from pydantic import BaseModel

class PaymentAdd(BaseModel):
    rental_id: int
    amount: int
    payment_method: str
    