# Plans API Integration

This document describes the integration of the Plans API with modern compact cards in the React Native Expo app.

## API Endpoint

**GET** `https://55c1e6e5-cc5c-43f8-a6bc-09dbe6a8787c-00-30mdf3t7vv0b7.riker.replit.dev/api/plans`

### Response Structure

```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "plans": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "duration": number,
      "cost": "string",
      "isActive": boolean,
      "features": [
        {
          "id": "string",
          "name": "string",
          "description": "string"
        }
      ],
      "subPlans": [],
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "totalPlans": number
}
```

## Components

### PlanList Component

A modern, responsive component that displays plans in compact card format with gradient headers and feature lists.

#### Props

```typescript
interface PlanListProps {
  onPlanSelect?: (plan: Plan) => void;
  selectedPlanId?: string;
  showHeader?: boolean;
}
```

#### Usage Examples

##### Basic Usage

```tsx
import { PlanList } from "@/app/components";

export default function PlansScreen() {
  const handlePlanSelect = (plan: Plan) => {
    console.log("Selected plan:", plan.name);
  };

  return <PlanList onPlanSelect={handlePlanSelect} showHeader={true} />;
}
```

##### With Selection State

```tsx
import { PlanList } from "@/app/components";
import { useState } from "react";

export default function PlansScreen() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>();

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    // Handle plan selection logic
  };

  return (
    <PlanList
      onPlanSelect={handlePlanSelect}
      selectedPlanId={selectedPlanId}
      showHeader={true}
    />
  );
}
```

### PlanSelectionComponent

A complete screen component for plan selection with confirmation dialogs and skip option.

#### Props

```typescript
interface PlanSelectionComponentProps {
  onPlanSelected?: (plan: Plan) => void;
  onContinue?: (selectedPlan: Plan) => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
}
```

#### Usage

```tsx
import { PlanSelectionComponent } from "@/app/components";

export default function SelectPlan() {
  const handlePlanContinue = (plan: Plan) => {
    // Navigate to payment or next step
    console.log("Proceeding with plan:", plan.name);
  };

  const handleSkip = () => {
    // Navigate to next screen without plan selection
    console.log("Skipping plan selection");
  };

  return (
    <PlanSelectionComponent
      onContinue={handlePlanContinue}
      onSkip={handleSkip}
      showSkipOption={true}
    />
  );
}
```

## Features

### Visual Design

- **Gradient Headers**: Each plan type has a unique gradient color scheme

  - Gold: Gold to Orange gradient
  - Diamond: Light Blue to Dark Gray gradient
  - Silver: Silver to Gray gradient
  - Basic: Light Green to Green gradient
  - Starter: Plum to Purple gradient
  - Default: Blue gradient for other plans

- **Compact Cards**: Optimized for mobile viewing with:

  - Plan name and duration badge in header
  - Large price display
  - Feature list with bullet points
  - Selection state indicators
  - Shadow and elevation effects

- **Responsive Layout**: Cards adapt to different screen sizes

### Functionality

- **Plan Selection**: Single-tap plan selection with visual feedback
- **Loading States**: Shows loading indicator while fetching plans
- **Error Handling**: Graceful error handling with retry options
- **Filtering**: Only shows active plans
- **Sorting**: Plans sorted by price (ascending)

### API Integration

- **Automatic Retry**: Built-in retry mechanism for failed requests
- **Error Boundaries**: Comprehensive error handling
- **Type Safety**: Full TypeScript support with defined interfaces
- **Caching**: Efficient data fetching and state management

## Types

```typescript
interface Plan {
  id: string;
  name: string;
  description: string;
  duration: number;
  cost: string;
  isActive: boolean;
  features: PlanFeature[];
  subPlans: any[];
  createdAt: string;
  updatedAt: string;
}

interface PlanFeature {
  id: string;
  name: string;
  description: string;
}

interface PlansResponse extends ApiResponse {
  plans: Plan[];
  totalPlans: number;
}
```

## File Structure

```
app/
├── components/
│   ├── shared/
│   │   └── PlanList.tsx              # Main PlanList component
│   └── screens/
│       └── PlanSelectionComponent.tsx # Complete selection screen
├── services/
│   └── apiService.ts                 # API service with getPlans method
├── types/
│   └── api.ts                        # Type definitions
└── constants/
    └── Api.ts                        # API configuration
```

## Customization

### Colors

You can customize the gradient colors by modifying the `getGradientColors` function in `PlanList.tsx`:

```typescript
const getGradientColors = (planName: string): [string, string] => {
  const name = planName.toLowerCase();
  if (name.includes("custom")) return ["#YOUR_COLOR_1", "#YOUR_COLOR_2"];
  // ... existing conditions
  return ["#DEFAULT_COLOR_1", "#DEFAULT_COLOR_2"];
};
```

### Badge Colors

Customize badge colors in the `getBadgeColor` function:

```typescript
const getBadgeColor = (planName: string) => {
  const name = planName.toLowerCase();
  if (name.includes("custom")) return "#YOUR_BADGE_COLOR";
  // ... existing conditions
  return "#DEFAULT_BADGE_COLOR";
};
```

## Testing

The component has been tested with the live API endpoint and includes:

- ✅ API connectivity
- ✅ Data parsing and type safety
- ✅ Error handling
- ✅ Loading states
- ✅ Plan selection functionality
- ✅ Responsive design
- ✅ Gradient rendering
- ✅ Feature list display

## Integration Example

See the `explore.tsx` tab for a complete working example of the PlanList component integrated into the app navigation.

## Next Steps

1. **Payment Integration**: Connect plan selection to payment processing
2. **User Preferences**: Save selected plans to user profile
3. **Analytics**: Track plan selection metrics
4. **A/B Testing**: Test different card layouts and colors
5. **Offline Support**: Cache plans for offline viewing
