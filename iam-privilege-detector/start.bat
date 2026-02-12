@echo off
echo ========================================
echo IAM Privilege Escalation Detector
echo ========================================
echo.

REM Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Python is not installed
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check Node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js 16 or higher
    pause
    exit /b 1
)

echo Setting up backend...
cd backend

if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo Starting backend server...
start "IAM Backend" cmd /k python main.py

cd ..
timeout /t 3 >nul

echo.
echo Setting up frontend...
cd frontend

if not exist "node_modules\" (
    echo Installing npm dependencies...
    call npm install
)

echo Starting frontend server...
start "IAM Frontend" cmd /k npm run dev

cd ..

echo.
echo ========================================
echo Application started successfully!
echo.
echo Dashboard: http://localhost:3000
echo API: http://localhost:8000
echo.
echo Close the command windows to stop servers
echo ========================================
pause
