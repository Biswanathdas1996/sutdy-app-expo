# Learning Goals API Integration

This document describes the integration of the learning goals API endpoint into the Expo React Native app.

## API Endpoint

- **URL**: `PUT /api/user/learning-goals`
- **Base URL**: `https://55c1e6e5-cc5c-43f8-a6bc-09dbe6a8787c-00-30mdf3t7vv0b7.riker.replit.dev`

## Integration Details

### 1. API Constants (`app/constants/Api.ts`)

Added the learning goals endpoint to the API configuration:

```typescript
USER: {
  ENGLISH_LEVEL: "/api/user/english-level",
  LEARNING_GOALS: "/api/user/learning-goals",
}
```

### 2. Types (`app/types/api.ts`)

Added TypeScript interfaces for learning goals:

```typescript
export interface LearningGoalsUpdateRequest {
  sessionId: string;
  learningGoals: string[];
}

export interface LearningGoalsUpdateResponse extends ApiResponse {
  sessionId?: string;
  learningGoals?: string[];
}
```

### 3. API Service (`app/services/apiService.ts`)

Added `updateLearningGoals` method that:

- Gets the user's session ID from stored tokens
- Maps UI purpose names to API-compatible format
- Makes a PUT request to the learning goals endpoint
- Handles errors gracefully

#### Purpose Mapping

The component's purpose names are mapped to API-compatible values:

- "Job/Business" → "career_advancement"
- "Abroad" → "travel"
- "Improve skills" → "skill_improvement"
- "Academic" → "education"
- "Practise" → "practice"
- "Pronunciation" → "pronunciation"
- "CEFR Test" → "test_preparation"
- "Other" → "other"

### 4. Onboarding Hook (`app/hooks/useOnboarding.ts`)

Updated `handleNext` to call the learning goals API when moving from the purpose selection step:

```typescript
if (currentStep === "purpose" && userAnswers.purpose.length > 0) {
  const result = await ApiService.updateLearningGoals(userAnswers.purpose);
  // Handle success/error
}
```

### 5. UI Components

Updated `PurposeSelectionComponent` to:

- Accept an `isLoading` prop
- Show "Saving..." text on the continue button when loading
- Disable the button during API calls

### 6. Integration Point (`app/(tabs)/index.tsx`)

Pass the `isLoading` state from the onboarding hook to the PurposeSelectionComponent.

## Request Format

```bash
curl -X PUT "https://55c1e6e5-cc5c-43f8-a6bc-09dbe6a8787c-00-30mdf3t7vv0b7.riker.replit.dev/api/user/learning-goals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"sessionId":"session_id_from_registration","learningGoals":["career_advancement","travel","education"]}'
```

## Expected Response

```json
{
  "success": true,
  "message": "Learning goals updated successfully",
  "sessionId": "session_id",
  "learningGoals": ["career_advancement", "travel", "education"]
}
```

## Error Handling

- Invalid session ID: Shows error message in console
- Network errors: Gracefully handled with user-friendly messages
- Loading states: Button disabled and shows "Saving..." during API calls

## Testing

Run the test script to verify the integration:

```bash
node test-api.js
```

Note: The test will show 401 errors when using test tokens, which is expected behavior.
