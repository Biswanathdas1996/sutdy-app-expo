# 🚀 Study App - Complete Setup Guide

This guide will help you set up and run both the backend API server and the React Native frontend.

## 📋 Prerequisites

- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- Expo CLI (will be installed with dependencies)
- A code editor (VS Code recommended)

## 🏗️ Project Structure

```
React Native/
├── app/                    # React Native app source code
├── backend/                # Node.js Express API server
│   ├── routes/            # API route handlers
│   ├── database.js        # In-memory database
│   ├── server.js          # Main server file
│   └── README.md          # Backend documentation
├── package.json           # Frontend dependencies
└── SETUP_GUIDE.md         # This file
```

## ⚙️ Setup Instructions

### Step 1: Install Frontend Dependencies

```powershell
# From the project root directory
npm install
```

### Step 2: Install Backend Dependencies

```powershell
# Navigate to backend folder and install
cd backend
npm install
cd ..
```

### Step 3: Start the Backend Server

**Option A: Start in background (recommended for development)**
```powershell
# Open a new PowerShell terminal
cd backend
npm start
```

**Option B: Start with auto-reload (for backend development)**
```powershell
cd backend
npm run dev
```

The backend server will start at: **http://localhost:3000**

You should see:
```
🚀 Server running on port 3000
📍 http://localhost:3000
💚 Health check: http://localhost:3000/api/health
```

### Step 4: Start the React Native App

**In a new terminal window:**
```powershell
# From the project root directory
npm start
```

Or use the VS Code task:
- Press `Ctrl+Shift+P`
- Type "Tasks: Run Task"
- Select "Start Expo App"

This will start the Expo development server. You'll see options to:
- Press `w` to open in web browser
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan QR code with Expo Go app on your phone

## 📱 Testing on Different Platforms

### Web Browser (Easiest)
1. Backend server running on http://localhost:3000 ✓
2. Press `w` in the Expo terminal
3. App will open in your browser

### Android/iOS Emulator
1. Backend server running on http://localhost:3000 ✓
2. Start your emulator
3. Press `a` (Android) or `i` (iOS) in Expo terminal

### Physical Device (Same Network)
1. Find your computer's IP address:
   ```powershell
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   # Example: 192.168.1.100
   ```

2. Update the API base URL in `app/constants/Api.ts`:
   ```typescript
   BASE_URL: "http://192.168.1.100:3000",  // Use YOUR IP address
   ```

3. Make sure your phone and computer are on the **same WiFi network**

4. Scan the QR code with Expo Go app

## 🧪 Testing the Backend API

### Quick Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
```

### Run Full API Tests
```powershell
cd backend
node test-api.js
```

This will test all API endpoints and show detailed results.

### Manual API Testing

**Register a User:**
```powershell
$body = @{
    fullName = "John Doe"
    mobileNumber = "9876543210"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Get Available Plans:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/plans" -Method GET
```

## 🔍 Verifying Everything Works

### Backend Checklist
- [ ] Backend server started successfully (port 3000)
- [ ] Health check returns success: http://localhost:3000/api/health
- [ ] API documentation visible: http://localhost:3000/

### Frontend Checklist
- [ ] Expo server started successfully
- [ ] No error messages in terminal
- [ ] App opens in chosen platform (web/emulator/device)
- [ ] Can see the welcome/login screen

## 🎯 Common Issues & Solutions

### Issue: Backend not starting
**Solution:**
- Check if port 3000 is already in use
- Kill any existing node processes:
  ```powershell
  Get-Process -Name node | Stop-Process -Force
  ```

### Issue: "Network error" in app
**Solutions:**
1. Verify backend is running: http://localhost:3000/api/health
2. Check API_CONFIG.BASE_URL in `app/constants/Api.ts`
3. For physical device: Use computer's IP instead of localhost
4. Ensure firewall isn't blocking port 3000

### Issue: Module not found errors
**Solution:**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# For backend
cd backend
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: Expo not starting
**Solution:**
```powershell
# Clear Expo cache
npx expo start -c
```

## 📊 Available Test Data

### Plans
- Basic Plan: ₹499 (30 days)
- Pro Plan: ₹1299 (90 days)  
- Premium Plan: ₹2299 (180 days)

### Coupon Codes
- `WELCOME50` - 50% off (min ₹500)
- `SAVE100` - ₹100 off (min ₹1000)

### Test Login
Any mobile number works for testing:
- Mobile: `9876543210`
- Name: `Test User`

For OTP login (membership):
- Mobile: Any 10-digit number
- OTP: Any 4-digit number (e.g., `1234`)

## 🔄 Development Workflow

### Normal Development
1. Start backend server (leave it running)
2. Start Expo in separate terminal
3. Make changes to code
4. App hot-reloads automatically

### Backend Changes
1. Stop backend server (Ctrl+C)
2. Make changes
3. Restart server
4. App will reconnect automatically

### Testing New Features
1. Test backend endpoint first (using PowerShell or test-api.js)
2. Then test in React Native app
3. Check both terminal outputs for errors

## 📚 API Documentation

Full API documentation is available at:
- **Root:** http://localhost:3000/
- **Health:** http://localhost:3000/api/health
- **Detailed docs:** See `backend/README.md`

## 🛠️ Development Tips

1. **Keep terminals organized:**
   - Terminal 1: Backend server
   - Terminal 2: Expo/React Native
   - Terminal 3: For testing/commands

2. **Check logs:**
   - Backend logs show all API requests
   - Expo logs show app errors and console.log output

3. **Hot reload:**
   - Frontend changes reload automatically
   - Backend changes require server restart

4. **Browser DevTools:**
   - Press F12 in web browser for console/network tab
   - Use React DevTools for debugging components

## 🚀 Next Steps

After successful setup:
1. ✅ Test user registration flow
2. ✅ Test onboarding screens (English level, goals, skills)
3. ✅ View subscription plans
4. ✅ Test coupon validation
5. ✅ Test membership registration

## 📞 Need Help?

- Check backend logs in the terminal
- Check Expo logs in the terminal
- Verify network connectivity
- Try restarting both servers
- Check the README files in backend folder

## 🎉 You're All Set!

Both servers are now running and connected. You can start developing and testing the app!

**Backend:** http://localhost:3000
**Frontend:** http://localhost:8081 (or Expo provided URL)
