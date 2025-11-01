# Stop All Servers Script
# Stops backend and Expo servers

Write-Host "🛑 Stopping all Study App servers..." -ForegroundColor Yellow
Write-Host ""

# Stop all Node processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "✓ All servers stopped" -ForegroundColor Green
Write-Host ""
Write-Host "You can close this window now."
Start-Sleep -Seconds 2
