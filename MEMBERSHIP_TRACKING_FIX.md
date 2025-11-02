# Membership Tracking System - Complete Fix

## Problem
- Duplicate user entries in the `users` table
- Membership form data was being stored directly in the `users` table
- Auto-login couldn't find membership because it was looking in the wrong place

## Solution

### 1. **Separate Data Concerns**
Created two distinct tables:
- `membership_registrations` - Stores ALL membership form submissions
- `users` - Stores ONLY login credentials and basic user info

### 2. **Database Schema**
```sql
-- New table: membership_registrations
CREATE TABLE IF NOT EXISTS membership_registrations (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) UNIQUE NOT NULL,
  whatsapp_number VARCHAR(20),
  age INTEGER,
  gender VARCHAR(50),
  country VARCHAR(100),
  english_skills TEXT[],
  highest_qualification VARCHAR(255),
  speaking_partner_interest BOOLEAN,
  about_you TEXT,
  profile_photo_base64 TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **Complete Flow**

#### **Registration Flow**
```
User submits membership form
  ↓
POST /api/membership/register
  ↓
[TRANSACTION START]
  ↓
1. Insert into membership_registrations (full form data)
  ↓
2. Insert/Update users table (for login) with ON CONFLICT
  ↓
[TRANSACTION COMMIT]
  ↓
Success - Returns both membership.id and user.id
```

#### **Auto-Login Flow**
```
After successful registration
  ↓
AuthService.loginWithOTP({ mobileNumber, otp: "1234" })
  ↓
POST /api/auth/membership-login
  ↓
1. Find membership in membership_registrations table
  ↓
2. Find/Create user in users table (for session)
  ↓
3. Create session
  ↓
Success - User logged in with full profile data
```

### 4. **Key Functions Updated**

#### `backend/routes/membership.js`
```javascript
// Uses transaction to ensure both operations succeed
// 1. Inserts into membership_registrations
// 2. Inserts/Updates users with ON CONFLICT DO UPDATE
```

#### `backend/database.js`
```javascript
// findMembershipByMobile()
// NOW: SELECT * FROM membership_registrations WHERE mobile_number = $1
// BEFORE: SELECT * FROM users WHERE mobile = $1 AND whatsapp_number IS NOT NULL
```

#### `backend/routes/auth.js` (membership-login)
```javascript
// Queries membership_registrations to verify membership
// Then finds/creates user in users table for session
```

### 5. **Prevents Duplicates**
```sql
-- In users table insert
ON CONFLICT (mobile) DO UPDATE SET
  name = EXCLUDED.name,
  whatsapp_number = EXCLUDED.whatsapp_number,
  updated_at = CURRENT_TIMESTAMP
```

### 6. **Table Creation**
The `membership_registrations` table is automatically created when the server starts:
```javascript
// backend/routes/membership.js
async function ensureMembershipTable() {
  const sqlPath = path.join(__dirname, '..', 'config', 'schema-membership-table.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);
}
```

## Results

✅ **No More Duplicates**
- `ON CONFLICT` prevents multiple user entries
- Single user record per mobile number

✅ **Proper Data Separation**
- Membership form data → `membership_registrations` table
- Login credentials → `users` table

✅ **Auto-Login Works**
- Finds membership in `membership_registrations`
- Creates/updates user in `users` table
- Creates session successfully

✅ **Transaction Safety**
- Both inserts succeed or both fail
- No partial data

## Testing

### Expected Database State After Registration
```sql
-- Should have 1 entry in membership_registrations
SELECT * FROM membership_registrations WHERE mobile_number = '8001691299';

-- Should have 1 entry in users
SELECT * FROM users WHERE mobile = '8001691299';

-- Verify no duplicates
SELECT mobile, COUNT(*) FROM users GROUP BY mobile HAVING COUNT(*) > 1;
```

### Test the Complete Flow
1. Submit membership form
2. Check server logs for "✅ Membership registration created"
3. Check server logs for "✅ User created/updated for login"
4. Verify auto-login succeeds
5. Navigate to plans screen
6. Check database - should see 1 user, 1 membership

## Files Modified
1. `backend/config/schema-membership-table.sql` (NEW)
2. `backend/routes/membership.js` (UPDATED)
3. `backend/database.js` (UPDATED - findMembershipByMobile)
4. `backend/routes/auth.js` (NO CHANGE - already correct)

## Next Steps
1. ✅ Test membership registration
2. ✅ Verify auto-login works
3. ✅ Check database for single user entry
4. ⏳ Implement payment integration for plan selection
5. ⏳ Update user profile with selected plan after payment
