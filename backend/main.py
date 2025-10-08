from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uvicorn

from . import crud, models, schemas, security, trash_detector
from .database import SessionLocal, engine, create_db_and_tables

# Create database tables
create_db_and_tables()

app = FastAPI(
    title="Trash Detection API",
    description="API for trash detection and incentive system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

async def get_current_admin_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

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

# Admin endpoints
@app.get("/admin/users/", response_model=List[schemas.User])
async def get_all_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get all users (admin only)"""
    return crud.get_users(db=db, skip=skip, limit=limit)

@app.get("/admin/submissions/", response_model=List[schemas.Submission])
async def get_all_submissions(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get all submissions (admin only)"""
    return crud.get_submissions(db=db, skip=skip, limit=limit)

@app.post("/admin/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_admin_user)
):
    """Toggle user active status (admin only)"""
    user = crud.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {user.username} active status: {user.is_active}"}

@app.post("/admin/users/{user_id}/make-admin")
async def make_user_admin(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_admin_user)
):
    """Make user admin (admin only)"""
    user = crud.get_user(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_superuser = True
    db.commit()
    return {"message": f"User {user.username} is now an admin"}

# Leaderboard endpoint
@app.get("/leaderboard/")
def get_leaderboard(
    limit: int = 10, 
    db: Session = Depends(get_db)
):
    """Get top users by points"""
    users = db.query(models.User).filter(models.User.is_active == True).order_by(models.User.points.desc()).limit(limit).all()
    return [
        {
            "username": user.username,
            "points": user.points,
            "rank": i + 1
        }
        for i, user in enumerate(users)
    ]

# Statistics endpoint
@app.get("/stats/")
async def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get user statistics"""
    user_submissions = db.query(models.Submission).filter(models.Submission.owner_id == current_user.id).all()
    
    total_submissions = len(user_submissions)
    total_points = sum(sub.score for sub in user_submissions)
    
    # Get user rank
    users_above = db.query(models.User).filter(
        models.User.points > current_user.points,
        models.User.is_active == True
    ).count()
    user_rank = users_above + 1
    
    return {
        "total_submissions": total_submissions,
        "total_points": total_points,
        "current_rank": user_rank,
        "average_score": total_points / total_submissions if total_submissions > 0 else 0
    }

# Global statistics (admin only)
@app.get("/admin/stats/")
async def get_global_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get global statistics (admin only)"""
    total_users = db.query(models.User).filter(models.User.is_active == True).count()
    total_submissions = db.query(models.Submission).count()
    total_detections = db.query(models.Detection).count()
    
    # Get top 5 users
    top_users = db.query(models.User).filter(models.User.is_active == True).order_by(models.User.points.desc()).limit(5).all()
    
    return {
        "total_users": total_users,
        "total_submissions": total_submissions,
        "total_detections": total_detections,
        "top_users": [
            {
                "username": user.username,
                "points": user.points
            }
            for user in top_users
        ]
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the Trash Detection API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
