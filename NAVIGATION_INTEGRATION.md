# Navigation Integration Guide

## Overview

The AppNavigator has been enhanced with three new screens:

- **SimpleUserProfileComponent**: A simplified user profile screen
- **CheckoutComponent**: Payment and checkout flow
- **PaymentSuccessScreen**: Success screen after payment completion

## New Screen Types

```typescript
type RootStackParamList = {
  // ... existing screens
  SimpleUserProfile: undefined;
  Checkout: { plan: Plan };
  PaymentSuccess: { plan: Plan; finalAmount: number };
};
```

## Navigation Examples

### 1. Navigate to Simple User Profile

```typescript
// From any screen component with navigation access
navigation.navigate("SimpleUserProfile");
```

### 2. Navigate to Checkout with Plan

```typescript
// When a user selects a plan
const handlePlanSelect = (selectedPlan: Plan) => {
  navigation.navigate("Checkout", { plan: selectedPlan });
};
```

### 3. Navigate to Payment Success

```typescript
// From CheckoutComponent after successful payment
const handlePaymentSuccess = (plan: Plan, finalAmount: number) => {
  navigation.navigate("PaymentSuccess", { plan, finalAmount });
};
```

## Screen Flow Integration

### OTP Login Flow

```
OTPLogin → SimpleUserProfile
```

### Plan Selection Flow

```
Recommendation → SimpleUserProfile
AnyScreen → Checkout → PaymentSuccess → SimpleUserProfile
```

## Component Props

### SimpleUserProfileComponent

```typescript
interface Props {
  onBack: () => void;
  onEditProfile?: () => void;
}
```

### CheckoutComponent

```typescript
interface Props {
  plan: Plan;
  onBack: () => void;
  onPaymentSuccess?: (plan: Plan, finalAmount: number) => void;
  onPaymentCancel?: () => void;
}
```

### PaymentSuccessScreenWithNavigation

```typescript
interface Props {
  plan: Plan;
  finalAmount: number;
  onContinue: () => void;
  onViewPlans: () => void;
}
```

## Integration with Tabs

The AppNavigator is currently separate from the expo-router tab system. To integrate:

1. **Option A**: Replace tab content with stack screens
2. **Option B**: Use nested navigators
3. **Option C**: Use modals for checkout/payment flows

### Example Tab Integration

```typescript
// In explore.tsx (Plans tab)
import { useNavigation } from "@react-navigation/native";

export default function PlansScreen() {
  const navigation = useNavigation();

  const handlePlanSelect = (plan: Plan) => {
    // Navigate to checkout (requires proper navigation setup)
    navigation.navigate("Checkout", { plan });
  };

  return <PlanList onPlanSelect={handlePlanSelect} showHeader={true} />;
}
```

## Best Practices

1. **Error Handling**: Always handle navigation errors gracefully
2. **Type Safety**: Use the proper TypeScript types for navigation params
3. **Back Navigation**: Provide clear back navigation paths
4. **Loading States**: Show loading indicators during navigation transitions
5. **Deep Linking**: Consider deep linking support for direct navigation

## Testing Navigation

```typescript
// Test navigation to checkout
const mockPlan: Plan = {
  id: "test-plan",
  name: "Test Plan",
  cost: "999",
  duration: 30,
  features: [],
};

navigation.navigate("Checkout", { plan: mockPlan });
```

## Notes

- The PaymentSuccessScreen has been duplicated as PaymentSuccessScreenWithNavigation to support both expo-router and React Navigation patterns
- All new screens are properly typed and integrated with the existing navigation structure
- The SimpleUserProfile is used after OTP login for a streamlined experience
