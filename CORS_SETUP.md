# CORS Configuration Guide

## Frontend Changes (Already Applied)

The frontend API service has been updated to include proper CORS headers:

- Added `Accept: application/json` header
- Added CORS-related headers
- Set `mode: 'cors'` for fetch requests

## Backend Configuration Required

Since your backend is hosted on Replit, you need to configure CORS on your server. Here are the configurations for different backend frameworks:

### For Express.js (Node.js)

1. Install the CORS package:

```bash
npm install cors
```

2. Add CORS middleware to your Express app:

```javascript
const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS for all routes and origins
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

// For preflight requests
app.options("*", cors());

// Your other middleware and routes
app.use(express.json());
// ... rest of your app
```

### For a more secure setup (recommended for production):

```javascript
const corsOptions = {
  origin: [
    "http://localhost:8081", // Expo development server
    "exp://localhost:8081", // Expo client
    "https://your-app-domain.com", // Your production domain if any
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

app.use(cors(corsOptions));
```

### Manual CORS Headers (if not using cors package)

Add this middleware before your routes:

```javascript
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### For Python Flask

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
    }
})

# Or manually
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
    return response
```

### For Python FastAPI

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Replit-Specific Notes

1. Make sure your Replit server is running and accessible
2. The server URL in your `Api.ts` should match your Replit deployment URL
3. Ensure your Replit project has the CORS configuration applied

## Testing CORS

You can test if CORS is working by:

1. Running your test script:

```bash
node test-api.js
```

2. Checking browser/React Native debugger console for CORS errors

3. Using curl to test preflight requests:

```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v \
  https://your-replit-url.com/api/user/english-level
```

## Common CORS Issues

1. **Missing OPTIONS handler**: Ensure your backend handles OPTIONS requests
2. **Incorrect origin**: Make sure allowed origins include your development server
3. **Missing headers**: Ensure all required headers are in `allowedHeaders`
4. **Credentials**: If using authentication, set `credentials: true`

## Security Considerations

For production:

- Don't use `origin: '*'` with `credentials: true`
- Specify exact origins instead of wildcards
- Only allow necessary headers and methods
- Consider rate limiting and other security measures
