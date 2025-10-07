from sqlalchemy.orm import Session
from . import models, schemas, security

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_submissions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Submission).offset(skip).limit(limit).all()

def create_submission(db: Session, submission: schemas.SubmissionCreate, user_id: int):
    db_submission = models.Submission(**submission.dict(), owner_id=user_id)
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

def create_detection(db: Session, detection: schemas.DetectionCreate, submission_id: int):
    db_detection = models.Detection(**detection.dict(), submission_id=submission_id)
    db.add(db_detection)
    db.commit()
    db.refresh(db_detection)
    return db_detection
