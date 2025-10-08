#!/usr/bin/env python3
"""
Startup script for the Trash Detection Frontend
"""

import os
import sys
import subprocess
import shutil

def check_command_exists(command):
    """Check if a command exists in the system PATH"""
    return shutil.which(command) is not None

def main():
    print("🗑️ Starting Trash Detection Frontend...")
    
    # Check if we're in the right directory
    if not os.path.exists('frontend'):
        print("❌ Error: frontend directory not found. Please run this script from the project root.")
        sys.exit(1)
    
    # Check if Node.js and npm are installed
    if not check_command_exists('node'):
        print("❌ Node.js is not installed or not in PATH.")
        print("📥 Please install Node.js from: https://nodejs.org/")
        print("   Download the LTS version and restart your terminal after installation.")
        sys.exit(1)
    
    if not check_command_exists('npm'):
        print("❌ npm is not installed or not in PATH.")
        print("📥 npm usually comes with Node.js. Please reinstall Node.js from: https://nodejs.org/")
        sys.exit(1)
    
    # Change to frontend directory
    os.chdir('frontend')
    
    # Check if node_modules exists
    if not os.path.exists('node_modules'):
        print("📦 Installing npm dependencies...")
        try:
            result = subprocess.run(['npm', 'install'], check=True, capture_output=True, text=True)
            print("✅ Dependencies installed successfully!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error installing dependencies: {e}")
            print(f"Error output: {e.stderr}")
            sys.exit(1)
    
    print("🚀 Starting React development server...")
    print("🌐 Frontend will be available at: http://localhost:3000")
    print("\nPress Ctrl+C to stop the server\n")
    
    # Start the development server
    try:
        subprocess.run(['npm', 'start'])
    except KeyboardInterrupt:
        print("\n👋 Development server stopped. Goodbye!")

if __name__ == "__main__":
    main()
