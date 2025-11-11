from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
from datetime import time


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    age = Column(Integer)
    sex = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    role = Column(String, default="patient")


class UserFHIRMapping(Base):
    __tablename__ = "user_fhir_mapping"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    fhir_patient_id = Column(String, default="example", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to User
    user = relationship("User")


class SymptomIntensity(Base):
    __tablename__ = "symptom_intensity"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symptom_name = Column(String(100), nullable=False)
    intensity = Column(Integer, nullable=False)  # 1-10 scale
    duration_minutes = Column(Integer, default=0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # CHANGED

    # Relationship to User
    user = relationship("User")


class SymptomFrequency(Base):
    __tablename__ = "symptom_frequency"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symptom_name = Column(String(100), nullable=False)
    month_year = Column(DateTime, nullable=False)  # First day of month
    occurrence_count = Column(Integer, default=1)
    last_occurrence = Column(
        DateTime(timezone=True), server_default=func.now()
    )  # CHANGED

    # Relationship to User
    user = relationship("User")
