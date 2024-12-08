from sqlalchemy import Column, Integer, String, ForeignKey, Text, DECIMAL, Enum, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime,timezone

Base = declarative_base()

class Role(enum.Enum):
    customer = "customer"
    admin = "admin"

class CarStatus(enum.Enum):
    available = "available"
    rented = "rented"
    
class CarCategory(enum.Enum):
    budget = "budget"
    mid = "mid-range"
    luxury = "luxury"

class RentalStatus(enum.Enum):
    ongoing = "ongoing"
    completed = "completed"
    canceled = "canceled"

class PaymentStatus(enum.Enum):
    successful = "successful"
    failed = "failed"
    pending = "pending"

class PaymentMethod(enum.Enum):
    credit_card = "credit_card"
    debit_card = "debit_card"
    paypal = "paypal"
    cash = "cash"

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone_number = Column(String(15))
    address = Column(Text)
    role = Column(Enum(Role), default=Role.customer)
    created_at = Column(TIMESTAMP, default=datetime.now(timezone.utc))

    rentals = relationship('Rental', back_populates='user')

class Car(Base):
    __tablename__ = 'cars'

    car_id = Column(Integer, primary_key=True)
    make = Column(String(50), nullable=False)
    model = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    category = Column(Enum(CarCategory))
    registration_number = Column(String(20), unique=True, nullable=False)
    status = Column(Enum(CarStatus), default=CarStatus.available)
    daily_rent = Column(DECIMAL(10, 2), nullable=False)
    image_url = Column(Text)
    created_at = Column(TIMESTAMP, default=datetime.now(timezone.utc))

    rentals = relationship('Rental', back_populates='car')

class Rental(Base):
    __tablename__ = 'rentals'

    rental_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    car_id = Column(Integer, ForeignKey('cars.car_id', ondelete='CASCADE'), nullable=False)
    rental_date = Column(TIMESTAMP, default=datetime.now(timezone.utc))
    return_date = Column(TIMESTAMP)
    total_cost = Column(DECIMAL(10, 2))
    status = Column(Enum(RentalStatus), default=RentalStatus.ongoing)

    user = relationship('User', back_populates='rentals')
    car = relationship('Car', back_populates='rentals')
    payments = relationship('Payment', back_populates='rental')

class Payment(Base):
    __tablename__ = 'payments'

    payment_id = Column(Integer, primary_key=True)
    rental_id = Column(Integer, ForeignKey('rentals.rental_id', ondelete='CASCADE'), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    payment_date = Column(TIMESTAMP, default=datetime.now(timezone.utc))
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.successful)

    rental = relationship('Rental', back_populates='payments')



