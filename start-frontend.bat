@echo off
title React Native App - Expo
color 0B
echo.
echo ========================================
echo   Study App - React Native Frontend
echo ========================================
echo.

REM Check if node_modules exists
if not exist "%~dp0node_modules\" (
    echo Installing dependencies...
    echo This may take a few minutes...
    cd /d "%~dp0"
    call npm install
    echo.
)

echo Starting Expo development server...
echo.
echo After Expo starts, press:
echo   w - Open in web browser
echo   a - Open Android emulator
echo   i - Open iOS simulator
echo.

cd /d "%~dp0"
call npx expo start

pause
