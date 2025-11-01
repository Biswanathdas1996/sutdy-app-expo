# 🎓 Study App - English Learning Platform

A complete English learning platform built with React Native (Expo) and Node.js/Express backend.

## ✅ Project Status: READY TO RUN

Both frontend and backend are fully configured and ready to use!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend Server
**Double-click:** `start-backend.bat`

Or manually:
```bash
cd backend
npm start
```

✅ Backend will run at: **http://localhost:3000**

### Step 2: Start Frontend App
**Double-click:** `start-frontend.bat`

Or manually:
```bash
npm start
```

### Step 3: Open the App
In the Expo terminal, press:
- **`w`** - Open in web browser (easiest!)
- **`a`** - Open in Android emulator
- **`i`** - Open in iOS simulator
- **Scan QR** - Use Expo Go app on your phone

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **PROJECT_READY.md** | ⭐ Complete overview and features |
| **SETUP_GUIDE.md** | Detailed setup instructions |
| **QUICK_START.md** | Quick reference commands |
| **backend/README.md** | Full API documentation |

---

## 🔧 What's Included

### Backend API (Port 3000)
✅ User authentication & registration  
✅ Session management  
✅ User profile management  
✅ Subscription plans (3 tiers)  
✅ Coupon validation system  
✅ Payment processing  
✅ Membership registration  

### Frontend App (React Native/Expo)
✅ User onboarding flow  
✅ English level selection  
✅ Learning goals selection  
✅ Skills focus selection  
✅ Speaking partner matching  
✅ Plan selection & checkout  
✅ Payment integration (Razorpay ready)  

---

## 🧪 Quick Test

**Test backend is running:**
```powershell
# Open browser to: http://localhost:3000
# Should see API documentation
```

**Test in app:**
1. Start both servers
2. Press `w` in Expo terminal
3. Register with any mobile number
4. Go through onboarding flow
5. View subscription plans

---

## 📊 Test Data

**Login:**
- Mobile: Any 10-digit number (e.g., `9876543210`)
- Name: Any name
- OTP: Any 4 digits (e.g., `1234`)

**Plans:**
- Basic: ₹499 (30 days)
- Pro: ₹1,299 (90 days)
- Premium: ₹2,299 (180 days)

**Coupons:**
- `WELCOME50` - 50% off (min ₹500)
- `SAVE100` - ₹100 off (min ₹1,000)

---

## 📂 Project Structure

```
React Native/
├── app/                    # React Native app
│   ├── components/        # UI components
│   ├── screens/           # Screen components
│   ├── services/          # API services
│   └── navigation/        # Navigation
│
├── backend/               # Express API server
│   ├── routes/           # API endpoints
│   ├── database.js       # Data storage
│   └── server.js         # Main server
│
├── start-backend.bat     # ⭐ Start backend
├── start-frontend.bat    # ⭐ Start frontend
│
└── Documentation/
    ├── PROJECT_READY.md  # Complete overview
    ├── SETUP_GUIDE.md    # Setup instructions
    ├── QUICK_START.md    # Quick reference
    └── backend/README.md # API docs
```

---

## 🌐 API Endpoints

All at: `http://localhost:3000/api/`

**Authentication:**
- POST `/auth/register` - Register user
- POST `/auth/login` - Login user
- POST `/auth/membership-login` - OTP login

**User Profile:**
- PUT `/user/english-level`
- PUT `/user/learning-goals`
- PUT `/user/skills-focus`
- PUT `/user/speaking-partner`

**Plans & Payments:**
- GET `/plans` - Get all plans
- POST `/coupons/validate` - Validate coupon
- POST `/payments/process` - Process payment

See **backend/README.md** for complete API documentation.

---

## 🛠️ Tech Stack

**Frontend:**
- React Native 0.79
- Expo SDK 53
- React Navigation 7
- TypeScript
- Expo Speech & Audio

**Backend:**
- Node.js
- Express.js
- CORS enabled
- In-memory database (ready for MongoDB/PostgreSQL)

---

## 📱 Testing Options

### Web Browser (Easiest)
1. Start both servers
2. Press `w` in Expo terminal
3. Opens at http://localhost:8081

### Android/iOS Emulator
1. Start emulator first
2. Press `a` (Android) or `i` (iOS)

### Physical Device
1. Install Expo Go app
2. Scan QR code from Expo terminal
3. Make sure phone and computer on same WiFi
4. Update API URL to your computer's IP

---

## ⚡ Common Commands

```powershell
# Check backend health
Invoke-RestMethod http://localhost:3000/api/health

# Run API tests
cd backend
node test-api.js

# Clear Expo cache
npx expo start -c

# Stop all Node processes
Get-Process -Name node | Stop-Process -Force
```

---

## 🐛 Troubleshooting

**Backend won't start:**
```powershell
cd backend
npm install
npm start
```

**Frontend errors:**
```powershell
npm install
npx expo start -c
```

**Network error in app:**
- Verify backend running at http://localhost:3000
- Check `app/constants/Api.ts` has correct BASE_URL

---

## 📞 Getting Help

1. Read **SETUP_GUIDE.md** for detailed instructions
2. Check **backend/README.md** for API details
3. Review **QUICK_START.md** for common commands
4. Look at terminal error messages
5. Try restarting both servers

---

## 🎯 Next Steps

After successful setup:

1. ✅ Test user registration
2. ✅ Complete onboarding flow
3. ✅ Browse subscription plans
4. ✅ Test coupon codes
5. ✅ Explore membership features

---

## 🚀 Development

**Frontend changes:**
- Edit files in `app/`
- Auto-reloads immediately

**Backend changes:**
- Edit files in `backend/`
- Restart server (Ctrl+C, then `npm start`)

**Add new features:**
- Frontend: Add screens in `app/components/screens/`
- Backend: Add routes in `backend/routes/`

---

## 📄 License

MIT

---

## 🎉 Ready to Go!

Your app is fully set up and ready to run. Start with:
1. Double-click `start-backend.bat`
2. Double-click `start-frontend.bat`
3. Press `w` to open in browser

**Happy Learning & Coding! 🚀📚**

---

*Version 1.0.0 | Last Updated: November 2, 2025*
