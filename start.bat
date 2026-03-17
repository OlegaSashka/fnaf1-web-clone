@echo off
title FNAF Local Server
color 0A

echo ========================================
echo    FNAF LOCAL SERVER LAUNCHER
echo ========================================
echo.

cd /d "%~dp0"

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo.
    echo Install Python from python.org
    echo.
    pause
    exit /b
)

if not exist "index.html" (
    echo [ERROR] index.html not found!
    echo.
    echo Make sure this batch file is in the correct folder
    echo.
    pause
    exit /b
)

echo [OK] Python found
echo [OK] index.html found
echo.
echo Starting server at http://localhost:8000
echo.

start /B python -m http.server 8000 >nul 2>&1
timeout /t 2 /nobreak >nul
start http://localhost:8000

echo.
echo ========================================
echo    SERVER STARTED!
echo    Website opened in your browser
echo.
echo    Close this window to stop the server
echo ========================================
echo.
pause