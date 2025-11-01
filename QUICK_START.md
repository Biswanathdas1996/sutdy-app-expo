# 🎯 Quick Reference - Study App

## 🚀 Start Everything (Easiest Method)

```powershell
# Right-click start.ps1 and select "Run with PowerShell"
# OR in terminal:
.\start.ps1
```

This opens 2 windows:
- 🔧 Backend Server (port 3000)
- ⚛️ React Native App (Expo)

## 🛑 Stop Everything

```powershell
.\stop.ps1
```

Or press `Ctrl+C` in each terminal window.

---

## 📋 Manual Commands

### Start Backend Only
```powershell
cd backend
npm start
```
Server runs at: http://localhost:3000

### Start Frontend Only
```powershell
npm start
```
Then press:
- `w` for web browser
- `a` for Android emulator
- `i` for iOS simulator

---

## 🧪 Test Backend API

### Quick Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
```

### Full API Test Suite
```powershell
cd backend
node test-api.js
```

---

## 📱 Access the App

### Web Browser (Recommended for testing)
1. Start both servers
2. Press `w` in Expo terminal
3. App opens at http://localhost:8081

### On Your Phone (Same WiFi)
1. Get your computer's IP:
   ```powershell
   ipconfig
   # Look for IPv4 Address, e.g., 192.168.1.100
   ```

2. Update `app/constants/Api.ts`:
   ```typescript
   BASE_URL: "http://192.168.1.100:3000"
   ```

3. Scan QR code with Expo Go app

---

## 🔧 Common Commands

### Check if Backend is Running
```powershell
Invoke-RestMethod -Uri "http://localhost:3000" -Method GET
```

### View Node Processes
```powershell
Get-Process -Name node
```

### Kill All Node Processes
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Clear Expo Cache
```powershell
npx expo start -c
```

### Reinstall Dependencies
```powershell
# Frontend
Remove-Item -Recurse -Force node_modules
npm install

# Backend
cd backend
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 📊 Test Data

### Login Credentials
- **Mobile:** Any 10-digit number
- **Name:** Any name
- **OTP:** Any 4 digits (e.g., `1234`)

### Subscription Plans
- **Basic:** ₹499 (30 days)
- **Pro:** ₹1299 (90 days)
- **Premium:** ₹2299 (180 days)

### Coupon Codes
- `WELCOME50` - 50% off (min ₹500)
- `SAVE100` - ₹100 off (min ₹1000)

---

## 🔍 Important URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| API Health | http://localhost:3000/api/health |
| Expo Dev | http://localhost:8081 |
| Backend Docs | See `backend/README.md` |

---

## ⚡ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `Get-Process -Name node \| Stop-Process -Force` |
| Network error in app | Check backend is running & API_CONFIG.BASE_URL |
| Module not found | Delete `node_modules`, run `npm install` |
| Expo not starting | `npx expo start -c` |

---

## 📚 Documentation

- **Full Setup Guide:** `SETUP_GUIDE.md`
- **Backend API Docs:** `backend/README.md`
- **Frontend Code:** `app/` directory

---

## 🎯 Development Flow

1. ✅ Start backend server (port 3000)
2. ✅ Start Expo (React Native)
3. ✅ Open in browser or device
4. ✅ Make changes (auto-reloads)
5. ✅ Test features
6. ✅ Stop servers when done

---

## 📞 Need Help?

1. Check SETUP_GUIDE.md
2. Check backend/README.md
3. Look at terminal error messages
4. Try restarting both servers

---

**Made with ❤️ for English Learning**
