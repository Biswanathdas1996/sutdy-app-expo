# Skills Focus API Integration

## Overview

This document describes the integration of the skills focus API endpoint into the Expo React Native app.

## API Endpoint

- **URL**: `PUT /api/user/skills-focus`
- **Base URL**: `https://55c1e6e5-cc5c-43f8-a6bc-09dbe6a8787c-00-30mdf3t7vv0b7.riker.replit.dev`
- **Authentication**: Bearer token required

## Request Format

```json
{
  "sessionId": "session_id_from_registration",
  "skillsFocus": ["speaking", "listening", "reading", "writing"]
}
```

## Integration Details

### 1. API Constants (`app/constants/Api.ts`)

Added the skills focus endpoint to the API configuration:

```typescript
USER: {
  ENGLISH_LEVEL: "/api/user/english-level",
  LEARNING_GOALS: "/api/user/learning-goals",
  SKILLS_FOCUS: "/api/user/skills-focus", // NEW
}
```

### 2. Type Definitions (`app/types/api.ts`)

Added TypeScript interfaces for type safety:

```typescript
export interface SkillsFocusUpdateRequest {
  sessionId: string;
  skillsFocus: string[];
}

export interface SkillsFocusUpdateResponse extends ApiResponse {
  sessionId?: string;
  skillsFocus?: string[];
}
```

### 3. API Service (`app/services/apiService.ts`)

Implemented the `updateSkillsFocus` method with:

- Authentication token handling
- Session ID validation
- Skill name mapping from UI format to API format
- Error handling and logging
- Consistent return format

#### Skill Mapping

The method maps UI skill names to API-compatible format:

- `Speaking` → `speaking`
- `Writing` → `writing`
- `Reading` → `reading`
- `Listening` → `listening`
- `Pronunciation` → `pronunciation`
- `All` → `all`
- `Other` → `other`

### 4. Onboarding Hook (`app/hooks/useOnboarding.ts`)

Integrated the API call into the onboarding flow:

- Calls `updateSkillsFocus` when user moves from skills selection step
- Handles loading state and error logging
- Maintains consistency with other onboarding API calls

### 5. Skills Selection Component (`app/components/screens/SkillsSelectionComponent.tsx`)

The component was already properly set up to work with the integration:

- Uses `selectedSkills` and `onSkillToggle` props
- Prevents navigation when no skills are selected
- Displays available skills with proper UI

## Usage Flow

1. User selects skills in the `SkillsSelectionComponent`
2. User taps "Continue" button
3. `handleNext` in `useOnboarding` hook is called
4. `ApiService.updateSkillsFocus` is called with selected skills
5. API request is sent with proper authentication and session ID
6. Response is logged and user proceeds to next step

## Testing

The integration includes a test in `test-api.js` that verifies:

- Correct endpoint URL
- Proper request format
- Authentication header handling
- Response parsing

## Error Handling

- Network errors are caught and logged
- Authentication errors are handled gracefully
- Invalid session IDs are detected and reported
- All errors include user-friendly messages

## Security

- Uses stored authentication tokens
- Validates session ID before making requests
- Includes proper Content-Type headers
- Follows OAuth bearer token authentication pattern

## Dependencies

- `AuthService` for token management
- `API_CONFIG` for base URL and timeout configuration
- `ERROR_MESSAGES` for consistent error messaging
