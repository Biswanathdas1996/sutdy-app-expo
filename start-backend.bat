@echo off
title Backend API Server - Port 3000
color 0A
echo.
echo ========================================
echo   Study App - Backend API Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "%~dp0backend\node_modules\" (
    echo Installing dependencies...
    cd /d "%~dp0backend"
    call npm install
    echo.
)

echo Starting server on port 3000...
echo Backend will be available at: http://localhost:3000
echo.

cd /d "%~dp0backend"
node server.js

pause
