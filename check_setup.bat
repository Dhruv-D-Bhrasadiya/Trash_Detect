@echo off
echo 🛠️ Checking Trash Detection System Setup...
echo.

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org/downloads/
    pause
    exit /b 1
) else (
    echo ✅ Python is installed
)

echo.
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

echo.
echo Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    echo npm usually comes with Node.js. Please reinstall Node.js.
    pause
    exit /b 1
) else (
    echo ✅ npm is installed
)

echo.
echo 🎉 All prerequisites are installed!
echo You can now run:
echo   - start_backend.bat  (to start the backend)
echo   - start_frontend.bat (to start the frontend)
echo.
pause
