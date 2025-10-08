# 🛠️ Installation Guide for Windows

This guide will help you set up the Trash Detection System on Windows.

## 📋 Prerequisites

### 1. Install Node.js and npm

1. **Download Node.js**:
   - Go to https://nodejs.org/
   - Download the **LTS version** (recommended)
   - Run the installer and follow the setup wizard
   - **Important**: Make sure to check "Add to PATH" during installation

2. **Verify Installation**:
   Open Command Prompt or PowerShell and run:
   ```cmd
   node --version
   npm --version
   ```
   Both commands should return version numbers.

### 2. Install Python (if not already installed)

1. **Download Python**:
   - Go to https://python.org/downloads/
   - Download Python 3.8 or higher
   - **Important**: Check "Add Python to PATH" during installation

2. **Verify Installation**:
   ```cmd
   python --version
   pip --version
   ```

## 🚀 Quick Setup

### Option 1: Using the Startup Scripts (Recommended)

1. **Start Backend**:
   ```cmd
   python start_backend.py
   ```
   Or double-click `start_backend.bat`

2. **Start Frontend** (in a new terminal):
   ```cmd
   python start_frontend.py
   ```
   Or double-click `start_frontend.bat`

### Option 2: Manual Setup

#### Backend Setup:
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m backend.create_admin
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup:
```cmd
cd frontend
npm install
npm start
```

## 🔧 Troubleshooting

### Issue: "npm is not recognized"

**Solution**:
1. Restart your terminal/command prompt
2. If still not working, reinstall Node.js and make sure "Add to PATH" is checked
3. Alternatively, use the full path to npm:
   ```cmd
   "C:\Program Files\nodejs\npm.cmd" install
   ```

### Issue: "Could not find a version that satisfies the requirement torch"

**Solution**:
1. Make sure you're using Python 3.8-3.11 (Python 3.12+ may have compatibility issues)
2. Try installing PyTorch directly:
   ```cmd
   pip install torch==2.1.0 torchvision==0.16.0 torchaudio==2.1.0
   ```
3. If still failing, try the CPU-only version:
   ```cmd
   pip install torch==2.1.0+cpu torchvision==0.16.0+cpu torchaudio==2.1.0+cpu -f https://download.pytorch.org/whl/torch_stable.html
   ```

### Issue: "Permission denied" or "Access denied"

**Solution**:
1. Run Command Prompt as Administrator
2. Or try using PowerShell instead of Command Prompt

### Issue: "Module not found" errors

**Solution**:
1. Make sure you're in the correct directory
2. Activate the virtual environment:
   ```cmd
   backend\venv\Scripts\activate
   ```
3. Reinstall dependencies:
   ```cmd
   pip install -r requirements.txt
   ```

## 🌐 Access the Application

After successful setup:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 👤 Default Admin Login

- **Username**: `admin`
- **Password**: `admin123`

## 📞 Need Help?

If you encounter any issues:
1. Check this troubleshooting guide
2. Make sure all prerequisites are installed correctly
3. Try running the startup scripts with Administrator privileges
4. Check that ports 3000 and 8000 are not being used by other applications

## 🔄 Alternative: Using Docker (Advanced)

If you have Docker installed, you can run the entire system with:
```cmd
docker-compose up --build
```

But you'll need to create a `docker-compose.yml` file first.
