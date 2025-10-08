#!/usr/bin/env python3
"""
Startup script for the Trash Detection Backend
"""

import os
import sys
import subprocess

def main():
    print("🗑️ Starting Trash Detection Backend...")
    
    # Check if we're in the right directory
    if not os.path.exists('backend'):
        print("❌ Error: backend directory not found. Please run this script from the project root.")
        sys.exit(1)
    
    # Change to backend directory
    os.chdir('backend')
    
    # Check if virtual environment exists
    venv_path = 'venv'
    if not os.path.exists(venv_path):
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, '-m', 'venv', venv_path])
    
    # Determine activation script based on OS
    if os.name == 'nt':  # Windows
        activate_script = os.path.join(venv_path, 'Scripts', 'activate.bat')
        python_executable = os.path.join(venv_path, 'Scripts', 'python.exe')
        pip_executable = os.path.join(venv_path, 'Scripts', 'pip.exe')
    else:  # Unix/Linux/MacOS
        activate_script = os.path.join(venv_path, 'bin', 'activate')
        python_executable = os.path.join(venv_path, 'bin', 'python')
        pip_executable = os.path.join(venv_path, 'bin', 'pip')
    
    print("📥 Installing dependencies...")
    subprocess.run([pip_executable, 'install', '-r', 'requirements.txt'])
    
    # Create admin user if it doesn't exist
    print("👤 Creating admin user...")
    try:
        subprocess.run([python_executable, '-m', 'backend.create_admin'], check=True)
    except subprocess.CalledProcessError:
        print("ℹ️ Admin user might already exist or there was an issue creating it.")
    
    print("🚀 Starting FastAPI server...")
    print("📖 API Documentation will be available at: http://localhost:8000/docs")
    print("🔗 API Base URL: http://localhost:8000")
    print("\nPress Ctrl+C to stop the server\n")
    
    # Start the server
    try:
        subprocess.run([
            python_executable, '-m', 'uvicorn', 
            'backend.main:app', 
            '--reload', 
            '--host', '0.0.0.0', 
            '--port', '8000'
        ])
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")

if __name__ == "__main__":
    main()
