from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    points = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    submissions = relationship("Submission", back_populates="owner")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, index=True)
    score = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="submissions")
    detections = relationship("Detection", back_populates="submission")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String)
    confidence = Column(Float)
    xmin = Column(Float)
    ymin = Column(Float)
    xmax = Column(Float)
    ymax = Column(Float)
    submission_id = Column(Integer, ForeignKey("submissions.id"))

    submission = relationship("Submission", back_populates="detections")
