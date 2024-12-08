from pydantic import BaseModel

class PaymentAdd(BaseModel):
    rental_id: str
    amount: int
    payment_method:str
    