# 📖 Today's Lesson System - Complete Guide

## Overview
The lesson system automatically delivers 1 lesson per day to each student based on their English level. The system has **540 total lessons** (180 lessons × 3 levels).

---

## How It Works

### 📚 Lesson Sets Structure

**Set 1: A1-A2 (Beginner/Elementary)**
- 180 lessons for beginners
- Covers basic English fundamentals
- Assigned to users with levels: "Beginner" or "Elementary"

**Set 2: B1-B2 (Intermediate)**
- 180 lessons for intermediate learners
- Covers conversational and practical English
- Assigned to users with levels: "Intermediate" or "Upper Intermediate"

**Set 3: C1-C2 (Advanced)**
- 180 lessons for advanced learners
- Covers complex language structures
- Assigned to users with levels: "Advanced" or "Proficient"

---

## User Experience

### 1. **Profile Top Bar**
   - Users see a **📖 book icon** next to the badge icon
   - Click to open "Today's Lesson" popup

### 2. **Today's Lesson Popup**
   Shows:
   - **Level Badge**: Color-coded (A1-A2 = Green, B1-B2 = Blue, C1-C2 = Purple)
   - **Lesson Number**: Which lesson (1-180)
   - **Lesson Title**: Clear title for the topic
   - **Lesson Content**: Full educational content
   - **Exercises**: Optional practice exercises (JSON format)
   - **Media Resources**: Optional videos/audio (if admin adds URL)
   - **Mark as Complete**: Button to finish the lesson

### 3. **Automatic Daily Assignment**
   - **Every day**, the system automatically assigns the next lesson
   - Based on user's chosen English level
   - Lessons are given in sequential order (1 → 2 → 3 → ... → 180)
   - Can't skip ahead - must complete in order

---

## Backend API Endpoints

### 1. Get Today's Lesson
```
GET /api/lessons/today/:userId
```
**What it does:**
1. Checks user's English level from database
2. Maps level to lesson set (A1-A2, B1-B2, or C1-C2)
3. Checks if today's lesson already assigned
4. If not, assigns the next uncompleted lesson
5. Returns lesson data

**Response:**
```json
{
  "success": true,
  "data": {
    "assignmentId": 123,
    "viewed": false,
    "lesson": {
      "id": 45,
      "level": "A1-A2",
      "lessonNumber": 5,
      "title": "Greeting People",
      "content": "Learn how to greet people...",
      "exercises": [...],
      "mediaUrl": "https://..."
    }
  }
}
```

### 2. Mark Lesson as Viewed
```
PUT /api/lessons/mark-viewed/:assignmentId
```
Automatically called when user opens the lesson popup.

### 3. Complete Lesson
```
POST /api/lessons/complete
Body: { userId, lessonId, score }
```
Marks lesson as completed and moves to next lesson.

### 4. Get Progress
```
GET /api/lessons/progress/:userId
```
Shows how many lessons completed out of 180.

---

## Database Schema

### `lessons` Table
Stores all 540 lessons (admin creates these):
```sql
- id: Unique lesson ID
- level: 'A1-A2', 'B1-B2', or 'C1-C2'
- lesson_number: 1 to 180
- title: Lesson title
- content: Full lesson text
- exercises: JSON array (optional)
- media_url: Video/audio link (optional)
```

### `daily_lesson_assignments` Table
Tracks which lesson assigned to each user each day:
```sql
- user_id: Student ID
- lesson_id: Which lesson assigned
- assigned_date: Date (one per day)
- viewed: Has student opened it?
```

### `user_lesson_progress` Table
Tracks completion:
```sql
- user_id: Student ID
- lesson_id: Which lesson completed
- completed: TRUE/FALSE
- completion_date: When finished
- score: Quiz score (optional)
```

---

## Level Mapping Logic

The system automatically maps user-friendly level names to lesson sets:

| User's English Level | Lesson Set Assigned |
|---------------------|-------------------|
| Beginner            | A1-A2 (Set 1)     |
| Elementary          | A1-A2 (Set 1)     |
| Intermediate        | B1-B2 (Set 2)     |
| Upper Intermediate  | B1-B2 (Set 2)     |
| Advanced            | C1-C2 (Set 3)     |
| Proficient          | C1-C2 (Set 3)     |

This mapping is in `backend/routes/lessons.js` lines 38-45.

---

## Admin Portal Integration

### What Admin Needs to Do:
1. **Create 180 lessons for A1-A2 level**
   ```sql
   INSERT INTO lessons (level, lesson_number, title, content, exercises)
   VALUES ('A1-A2', 1, 'Introduction to English', 'Content here...', '[]');
   ```

2. **Create 180 lessons for B1-B2 level**
   ```sql
   INSERT INTO lessons (level, lesson_number, title, content, exercises)
   VALUES ('B1-B2', 1, 'Advanced Conversation', 'Content here...', '[]');
   ```

3. **Create 180 lessons for C1-C2 level**
   ```sql
   INSERT INTO lessons (level, lesson_number, title, content, exercises)
   VALUES ('C1-C2', 1, 'Professional English', 'Content here...', '[]');
   ```

### Recommended Admin Features:
- **Lesson Editor**: Form to create/edit lessons
- **Bulk Import**: Upload CSV with all 180 lessons
- **Preview**: See how lesson looks to students
- **Scheduling**: Set release dates (optional)

---

## Frontend Components

### Files Created:
1. **`app/services/lessonService.ts`**
   - API wrapper for lesson endpoints
   - Methods: getTodayLesson(), completeLesson(), markLessonViewed()

2. **`app/components/modals/TodayLessonModal.tsx`**
   - Beautiful popup showing lesson
   - Color-coded level badges
   - Scroll view for long content
   - Mark complete button

3. **`app/components/screens/UserProfileComponent.tsx`** (updated)
   - Added 📖 book icon in header
   - Opens lesson modal on click
   - Positioned next to badge icon

---

## Testing the System

### Test Scenario 1: Beginner User
1. User signs up with level "Beginner"
2. Clicks 📖 icon on profile
3. Sees "Lesson 1" from A1-A2 set
4. Tomorrow, sees "Lesson 2" from A1-A2 set

### Test Scenario 2: Advanced User
1. User signs up with level "Advanced"
2. Clicks 📖 icon on profile
3. Sees "Lesson 1" from C1-C2 set
4. Content is more challenging

### Test Scenario 3: Completion
1. User views Lesson 5
2. Clicks "Mark as Complete"
3. Tomorrow, automatically gets Lesson 6
4. Can track progress (5/180 complete)

---

## Key Features ✨

✅ **One Lesson Per Day** - Prevents overwhelming students
✅ **Level-Based** - Content matches skill level
✅ **Sequential** - Can't skip lessons
✅ **Auto-Assignment** - No manual selection needed
✅ **Progress Tracking** - See completion percentage
✅ **Mark as Viewed** - Tracks engagement
✅ **Optional Exercises** - Can include practice
✅ **Media Support** - Can add video/audio links
✅ **Beautiful UI** - Color-coded, easy to read

---

## Current Status ✅

- ✅ Database tables created
- ✅ Backend API fully functional
- ✅ Frontend components created
- ✅ Icon added to profile
- ✅ Modal popup working
- ✅ Level mapping configured
- ⏳ **Waiting for admin to add 540 lessons**

---

## Next Steps for You

1. **Start Backend Server**
   ```bash
   cd backend
   node server.js
   ```

2. **Test the Icon**
   - Open your app
   - Go to Profile
   - Click the 📖 icon
   - Should see "No lesson assigned yet" (because admin hasn't added lessons)

3. **Add Sample Lesson** (optional for testing)
   ```sql
   INSERT INTO lessons (level, lesson_number, title, content)
   VALUES ('A1-A2', 1, 'Welcome to English', 'This is your first lesson!');
   ```

4. **Set Your English Level** (if not set)
   - Make sure your user profile has english_level field
   - Should be one of: Beginner, Elementary, Intermediate, Upper Intermediate, Advanced, Proficient

---

## Support

If you see:
- "User has not selected English level yet" → Set your level in profile
- "No more lessons available" → Admin needs to add lessons for your level
- "Failed to load lesson" → Check backend server is running

The system is ready! Just needs lessons added by admin. 🚀
