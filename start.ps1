# Quick Start Script for Study App
# This script starts both backend and frontend servers

Write-Host "🚀 Starting Study App..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Start Backend Server
Write-Host ""
Write-Host "📡 Starting Backend Server..." -ForegroundColor Cyan
Write-Host "   Location: http://localhost:3000" -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Yellow; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Test backend health
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5
    Write-Host "✓ Backend server is running!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Backend server might take a moment to start..." -ForegroundColor Yellow
}

# Start Frontend (Expo)
Write-Host ""
Write-Host "📱 Starting React Native App (Expo)..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '⚛️ React Native App' -ForegroundColor Blue; npm start"

Write-Host ""
Write-Host "=" * 60 -ForegroundColor DarkGray
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend API:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "📱 Expo Server:  Check the React Native window" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for Expo to show QR code" -ForegroundColor Gray
Write-Host "  2. Press 'w' for web browser" -ForegroundColor Gray
Write-Host "  3. Or scan QR code with Expo Go app" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Read SETUP_GUIDE.md for detailed instructions" -ForegroundColor Gray
Write-Host "=" * 60 -ForegroundColor DarkGray
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
