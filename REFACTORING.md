# SpeakEdge App - Refactored Structure

This document explains the new modular structure of the SpeakEdge app after refactoring for better readability and maintainability.

## 🏗️ New Structure

### Components Directory (`app/components/`)

```
components/
├── index.ts                    # Main exports for easy importing
├── types.ts                    # TypeScript interfaces and types
├── screens/                    # Individual screen components
│   ├── WelcomeScreenComponent.tsx
│   ├── AIIntroductionComponent.tsx
│   ├── LevelSelectionComponent.tsx
│   ├── PurposeSelectionComponent.tsx
│   ├── SkillsSelectionComponent.tsx
│   ├── PartnerSelectionComponent.tsx
│   └── RecommendationComponent.tsx
├── modals/                     # Modal components
│   ├── SkipPopup.tsx
│   └── BenefitsModal.tsx
└── shared/                     # Reusable components and styles
    ├── SharedStyles.ts         # Common styles used across components
    ├── SpeakingIndicator.tsx   # AI speaking animation component
    ├── ModernButton.tsx        # Reusable button component
    └── OptionCard.tsx          # Reusable option selection card
```

### Hooks Directory (`app/hooks/`)

```
hooks/
├── useSpeech.ts               # Speech synthesis functionality
└── useOnboarding.ts           # Onboarding flow state management
```

## 🔧 Key Improvements

### 1. **Separation of Concerns**

- Each screen is now a separate component with its own responsibility
- Shared UI components are reusable across screens
- Business logic is extracted into custom hooks

### 2. **Better Type Safety**

- All types are defined in `types.ts`
- Consistent interfaces across components
- Proper TypeScript usage throughout

### 3. **Reusable Components**

- `ModernButton`: Consistent button styling with variant support
- `OptionCard`: Reusable selection cards with consistent behavior
- `SpeakingIndicator`: Animated speaking indicator for AI interactions

### 4. **Custom Hooks**

- `useSpeech`: Manages all speech synthesis functionality
- `useOnboarding`: Handles navigation and state management for the onboarding flow

### 5. **Shared Styles**

- `SharedStyles.ts`: Contains all common styles organized by functionality
- Consistent design system across all components
- Easy to maintain and update styles

## 📱 Screen Components

### WelcomeScreenComponent

- Initial signup/signin screen
- Name and mobile input fields
- Feature highlights

### AIIntroductionComponent

- Introduction to Rose (AI tutor)
- Speech bubble with personalized greeting
- Speaking indicator when AI is active

### LevelSelectionComponent

- English proficiency level selection
- Visual cards with emojis and colors
- Single selection interface

### PurposeSelectionComponent

- Learning purpose selection
- Multiple selection support
- Categorized options with icons

### SkillsSelectionComponent

- Skills focus area selection
- Multiple selection support
- Speaking, writing, reading, listening options

### PartnerSelectionComponent

- Speaking partner preference
- Single selection with large cards
- Yes/No/Other options

### RecommendationComponent

- Course recommendation display
- Language preference selection
- Call-to-action buttons

## 🎯 Usage Examples

### Importing Components

```typescript
import {
  WelcomeScreenComponent,
  ModernButton,
  SpeakingIndicator,
  UserAnswers,
  StepType,
} from "@/app/components";
```

### Using Custom Hooks

```typescript
const { isSpeaking, speakText, stopSpeaking } = useSpeech();
const { currentStep, userAnswers, handleNext } = useOnboarding();
```

### Reusable Button

```typescript
<ModernButton
  title="Continue"
  onPress={handleNext}
  disabled={!isFormValid}
  variant="primary"
/>
```

## 🚀 Benefits

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Shared components can be used across screens
3. **Type Safety**: Strong TypeScript interfaces prevent errors
4. **Performance**: Better code splitting and lazy loading potential
5. **Testing**: Easier to write unit tests for individual components
6. **Developer Experience**: Cleaner imports and better code organization

## 🔄 Migration Notes

The main `index.tsx` file is now much cleaner:

- Uses custom hooks for state management
- Renders appropriate screens based on current step
- Handles modals separately
- All business logic extracted to hooks
- All UI logic extracted to components

This refactoring makes the codebase more maintainable, testable, and easier for new developers to understand and contribute to.
