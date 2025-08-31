# API Integration Documentation

## Overview

This document describes the integration of the registration API endpoint into the SpeakEdge mobile app with complete session management.

## API Endpoint

```
POST https://55c1e6e5-cc5c-43f8-a6bc-09dbe6a8787c-00-30mdf3t7vv0b7.riker.replit.dev/api/auth/register
```

## Request Format

```json
{
  "fullName": "John Doe",
  "mobileNumber": "+1234567890"
}
```

## Response Format

```json
{
  "success": true,
  "message": "User registration API tested successfully - New user created",
  "method": "POST",
  "endpoint": "/api/auth/register",
  "payload": {
    "fullName": "John Doe",
    "mobileNumber": "+1234567890"
  },
  "responseTime": 109,
  "timestamp": "2025-08-24T05:22:31.021Z",
  "testResult": {
    "authToken": "91450e07-233b-417f-903d-ffe71feb2998",
    "sessionId": "5bc3de23-ad64-4407-8e14-02f5e0c3f000",
    "isNewUser": true,
    "userId": "5f076202-9cf9-4b0e-bdee-dbd076a14138",
    "userName": "John Doe"
  }
}
```

## Files Created/Modified

### 1. AuthService (`app/services/authService.ts`)

- Handles API communication for user registration and sign-in
- Processes the actual API response structure with `testResult`
- Automatically saves all authentication tokens and session data
- Includes error handling and timeout management
- Provides helper methods for getting tokens and session info

### 2. StorageService (`app/services/storageService.ts`)

- Manages comprehensive user session storage using AsyncStorage
- Stores multiple tokens: `authToken`, `sessionId`, `userId`
- Handles session expiration (24 hours)
- Provides individual token access methods
- Generates auth headers for future API calls

### 3. ApiService (`app/services/apiService.ts`)

- Utility service for making authenticated API calls
- Automatically includes stored tokens in headers
- Provides convenient methods: `get()`, `post()`, `put()`, `delete()`
- Handles authentication state validation
- Includes debugging utilities

### 4. API Types (`app/types/api.ts`)

- Updated TypeScript interfaces to match actual API response
- Includes `TestResult` interface for API response structure
- Enhanced `UserSession` interface with all token data

### 5. API Constants (`app/constants/Api.ts`)

- Centralized configuration for API endpoints
- Error message constants

### 6. WelcomeScreenComponent (`app/components/screens/WelcomeScreenComponent.tsx`)

- Updated to integrate with the registration API
- Added loading states and proper error handling
- Enhanced input validation

### 7. AuthExamples (`app/services/authExamples.ts`)

- Complete usage examples for all authentication features
- Demonstrates token usage and API calls
- Includes session management examples

## Stored Data

After successful registration/login, the following data is stored locally:

### Complete Session Object

```typescript
{
  user: {
    userId: "5f076202-9cf9-4b0e-bdee-dbd076a14138",
    userName: "John Doe",
    fullName: "John Doe",
    mobileNumber: "+1234567890",
    isNewUser: true
  },
  authToken: "91450e07-233b-417f-903d-ffe71feb2998",
  sessionId: "5bc3de23-ad64-4407-8e14-02f5e0c3f000",
  userId: "5f076202-9cf9-4b0e-bdee-dbd076a14138",
  userName: "John Doe",
  isNewUser: true,
  expiresAt: 1724569951021, // 24 hours from creation
  createdAt: 1724483551021
}
```

### Individual Storage Keys

- `@speakedge_user_session`: Complete session object
- `@speakedge_auth_token`: Authentication token for API calls
- `@speakedge_session_id`: Session identifier
- `@speakedge_user_id`: User ID

## Usage Examples

### Basic Registration

```typescript
import { AuthService } from "@/app/services/authService";

const result = await AuthService.register({
  fullName: "John Doe",
  mobileNumber: "+1234567890",
});

if (result.success) {
  console.log("Registration successful");
  console.log("Auth Token:", result.token);
  console.log("User ID:", result.user?.userId);
  // Navigate to next screen
}
```

### Making Authenticated API Calls

```typescript
import { ApiService } from "@/app/services/apiService";

// Simple GET request with auto-authentication
const userProfile = await ApiService.get("/api/user/profile");

// POST request with data
const updateResult = await ApiService.post("/api/user/preferences", {
  language: "en",
  theme: "dark",
});
```

### Manual API Calls with Tokens

```typescript
import { AuthService } from "@/app/services/authService";

// Get auth headers for manual fetch
const headers = await AuthService.getAuthHeaders();
// Headers will include:
// - Authorization: Bearer 91450e07-233b-417f-903d-ffe71feb2998
// - X-Session-ID: 5bc3de23-ad64-4407-8e14-02f5e0c3f000
// - X-User-ID: 5f076202-9cf9-4b0e-bdee-dbd076a14138

const response = await fetch("https://api.example.com/endpoint", {
  method: "POST",
  headers: {
    ...headers,
    "Custom-Header": "value",
  },
  body: JSON.stringify({ data: "example" }),
});
```

### Session Management

```typescript
import { AuthService } from "@/app/services/authService";

// Check if user is logged in
const isLoggedIn = await AuthService.isLoggedIn();

// Get current user
const currentUser = await AuthService.getCurrentUser();

// Get full session details
const session = await AuthService.getCurrentSession();

// Get individual tokens
const tokens = await AuthService.getUserTokens();
// Returns: { authToken, sessionId, userId }

// Sign out (clears all stored data)
await AuthService.signOut();
```

### Session Information for Debugging

```typescript
import { ApiService } from "@/app/services/apiService";

const sessionInfo = await ApiService.getSessionInfo();
console.log(sessionInfo);
// Output:
// {
//   isLoggedIn: true,
//   user: { userId: "...", userName: "...", ... },
//   tokens: {
//     authToken: "91450e07...",
//     sessionId: "5bc3de23...",
//     userId: "5f076202-9cf9-4b0e-bdee-dbd076a14138"
//   },
//   sessionExpiresAt: "2025-08-25T05:22:31.021Z"
// }
```

## Features Implemented

### ✅ Complete Token Storage

- Stores `authToken` for API authentication
- Stores `sessionId` for session tracking
- Stores `userId` for user identification
- Stores complete user profile data
- Automatic session expiration handling

### ✅ Automatic Auth Headers

- Generates proper headers for API calls
- Supports Bearer token authentication
- Includes session and user ID headers
- Ready for future API integrations

### ✅ Session Management

- 24-hour session expiration
- Automatic session validation
- Easy session clearing on sign out
- Session info debugging utilities

### ✅ Type Safety

- Complete TypeScript interfaces
- Matches actual API response structure
- Type-safe token and session handling

### ✅ Error Handling

- Network timeout handling (10 seconds)
- Server error responses
- Authentication state validation
- User-friendly error messages

## Dependencies Added

- `@react-native-async-storage/async-storage`: For local storage of user sessions and tokens

## Next Steps

1. Implement other API endpoints using the ApiService
2. Add automatic token refresh functionality
3. Implement biometric authentication
4. Add user profile management screens
5. Implement logout confirmation dialogs
6. Add session timeout warnings
