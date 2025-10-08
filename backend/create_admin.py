#!/usr/bin/env python3
"""
Script to create an admin user for the trash detection system
"""

from sqlalchemy.orm import Session
from .database import SessionLocal, create_db_and_tables
from . import models, security

def create_admin_user(username: str = "admin", password: str = "admin123"):
    """Create an admin user"""
    # Create database tables
    create_db_and_tables()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_admin = db.query(models.User).filter(models.User.username == username).first()
        if existing_admin:
            print(f"Admin user '{username}' already exists!")
            return existing_admin
        
        # Create new admin user
        hashed_password = security.get_password_hash(password)
        admin_user = models.User(
            username=username,
            hashed_password=hashed_password,
            is_superuser=True,
            is_active=True,
            points=0
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"Admin user '{username}' created successfully!")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print("Please change the password after first login!")
        
        return admin_user
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    
    username = sys.argv[1] if len(sys.argv) > 1 else "admin"
    password = sys.argv[2] if len(sys.argv) > 2 else "admin123"
    
    create_admin_user(username, password)
