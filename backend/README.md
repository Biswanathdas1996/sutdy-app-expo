# Study App Backend API

A complete Node.js/Express backend API for the English Learning Study App built with React Native/Expo.

## 🚀 Features

- **Authentication**: Register, Login, and OTP-based membership login
- **User Profile Management**: English level, learning goals, skills focus, speaking partner preferences
- **Plans & Subscriptions**: Multiple subscription plans with features
- **Coupon System**: Validate and apply discount coupons
- **Payment Processing**: Payment initiation and status tracking
- **Membership Registration**: Complete user profile with additional details

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and update if needed
   - Default port: 3000

## 🏃‍♂️ Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start at `http://localhost:3000`

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  {
    "fullName": "John Doe",
    "mobileNumber": "1234567890"
  }
  ```

- `POST /api/auth/login` - Login existing user
  ```json
  {
    "fullName": "John Doe",
    "mobileNumber": "1234567890"
  }
  ```

- `POST /api/auth/membership-login` - Login with OTP
  ```json
  {
    "mobileNumber": "1234567890",
    "otp": "1234"
  }
  ```

### User Profile (Requires Authentication)
- `PUT /api/user/english-level` - Update English level
  ```json
  {
    "sessionId": "session-id",
    "englishLevel": "intermediate"
  }
  ```

- `PUT /api/user/learning-goals` - Update learning goals
  ```json
  {
    "sessionId": "session-id",
    "learningGoals": ["career_advancement", "travel"]
  }
  ```

- `PUT /api/user/skills-focus` - Update skills focus
  ```json
  {
    "sessionId": "session-id",
    "skillsFocus": ["speaking", "listening"]
  }
  ```

- `PUT /api/user/speaking-partner` - Update speaking partner preference
  ```json
  {
    "sessionId": "session-id",
    "needsSpeakingPartner": true
  }
  ```

- `GET /api/user/profile-with-memberships` - Get user profile (requires auth header)

### Plans
- `GET /api/plans` - Get all available plans
- `GET /api/plans/:planId` - Get specific plan

### Coupons
- `POST /api/coupons/validate` - Validate coupon code
  ```json
  {
    "couponCode": "WELCOME50",
    "planId": "plan_1",
    "amount": 499
  }
  ```

### Payments
- `POST /api/payments/process` - Process payment
  ```json
  {
    "planId": "plan_1",
    "amount": 499,
    "couponCode": "WELCOME50",
    "paymentMethod": "razorpay"
  }
  ```

- `GET /api/payments/:paymentId/status` - Get payment status

### Membership
- `POST /api/membership/register` - Register membership with full profile
  ```json
  {
    "fullName": "John Doe",
    "mobileNumber": "1234567890",
    "whatsappNumber": "1234567890",
    "age": "25",
    "gender": "Male",
    "country": "India",
    "englishSkills": ["speaking", "listening"],
    "highestQualification": "Bachelor's",
    "speakingPartnerInterest": "Yes",
    "aboutYou": "I want to improve my English",
    "profilePhotoBase64": "base64-encoded-image"
  }
  ```

## 🧪 Testing the API

### Using the Test Script
```bash
npm test
```

### Using curl (Windows PowerShell)

**Health Check:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
```

**Register User:**
```powershell
$body = @{
    fullName = "Test User"
    mobileNumber = "9876543210"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Get Plans:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/plans" -Method GET
```

## 🔐 Authentication

The API uses session-based authentication. After successful login/registration, you'll receive:
- `authToken` - Use in Authorization header as `Bearer <token>`
- `sessionId` - Use in request body for user profile updates

## 📊 Available Plans

1. **Basic Plan** - ₹499 (30 days)
   - AI Conversations
   - Basic Lessons
   - Progress Tracking

2. **Pro Plan** - ₹1299 (90 days)
   - All Basic features
   - All Lessons
   - Speaking Partner
   - Priority Support

3. **Premium Plan** - ₹2299 (180 days)
   - All Pro features
   - Advanced Analytics
   - Certification
   - Live Sessions

## 🎫 Available Coupons

- `WELCOME50` - 50% off (min ₹500, max ₹500 discount)
- `SAVE100` - ₹100 off (min ₹1000)

## 🗄️ Data Storage

Currently using in-memory storage (resets on server restart). For production:
- Replace with MongoDB, PostgreSQL, or your preferred database
- Implement proper password hashing
- Add JWT token management
- Implement proper OTP verification service

## 🌐 CORS Configuration

CORS is enabled for all origins (`*`). Update in `server.js` for production:
```javascript
app.use(cors({
  origin: 'https://your-app-domain.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

## 🔄 Connecting React Native App

Update the BASE_URL in your React Native app:
```typescript
// app/constants/Api.ts
export const API_CONFIG = {
  BASE_URL: "http://localhost:3000",  // For local development
  // BASE_URL: "http://YOUR_IP:3000",  // For testing on physical device
  // ...
};
```

**For testing on physical device:**
1. Find your computer's IP address:
   ```powershell
   ipconfig
   ```
2. Use that IP in BASE_URL: `http://192.168.x.x:3000`
3. Make sure both devices are on the same network

## 📝 Development Notes

- Session tokens expire after 30 days
- All timestamps are in ISO format
- Errors return proper HTTP status codes
- All responses follow consistent format:
  ```json
  {
    "success": boolean,
    "message": string,
    "data": object (optional)
  }
  ```

## 🚧 Production Checklist

- [ ] Replace in-memory storage with persistent database
- [ ] Implement proper password hashing (bcrypt)
- [ ] Add JWT token management
- [ ] Implement real OTP service (Twilio, etc.)
- [ ] Add rate limiting
- [ ] Add request validation (express-validator)
- [ ] Set up proper logging (Winston, Morgan)
- [ ] Configure environment-specific CORS
- [ ] Add API documentation (Swagger)
- [ ] Implement proper error handling
- [ ] Add unit and integration tests
- [ ] Set up monitoring and alerts

## 📞 Support

For issues or questions, check the API documentation at: `http://localhost:3000/`

## 📄 License

MIT
