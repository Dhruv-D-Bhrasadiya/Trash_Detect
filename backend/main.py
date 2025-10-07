from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import shutil
import os

from . import crud, models, schemas, security, trash_detector
from .database import SessionLocal, engine, create_db_and_tables

# Create database tables
create_db_and_tables()

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except security.JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = security.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Ensure the uploads directory exists
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    detection_results = trash_detector.detect_trash(file_path)
    
    if "error" in detection_results:
        raise HTTPException(status_code=400, detail=detection_results["error"])

    # Create submission
    submission_create = schemas.SubmissionCreate(
        image_path=file_path,
        score=detection_results["score"]
    )
    submission = crud.create_submission(db=db, submission=submission_create, user_id=current_user.id)

    # Create detections
    for detection in detection_results["detections"]:
        detection_create = schemas.DetectionCreate(
            label=detection["label"],
            confidence=detection["confidence"],
            xmin=detection["box"]["xmin"],
            ymin=detection["box"]["ymin"],
            xmax=detection["box"]["xmax"],
            ymax=detection["box"]["ymax"],
        )
        crud.create_detection(db=db, detection=detection_create, submission_id=submission.id)

    # Update user points
    current_user.points += detection_results["score"]
    db.commit()

    return {"submission_id": submission.id, "results": detection_results}

@app.get("/submissions/", response_model=List[schemas.Submission])
def read_submissions(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    submissions = db.query(models.Submission).filter(models.Submission.owner_id == current_user.id).offset(skip).limit(limit).all()
    return submissions

@app.get("/")
def read_root():
    return {"message": "Welcome to the Trash Detection API"}
