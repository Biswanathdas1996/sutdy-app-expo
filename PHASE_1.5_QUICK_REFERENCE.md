# Phase 1.5 - Quick Reference Guide

## 🚀 How to Use the New Plan Components

### 1. Import Components
```typescript
import { 
  FreedomPlanCard, 
  CorePlanCard, 
  KidsPlanCard,
  AllPlansScreen 
} from '@/app/components';
```

### 2. Fetch Plans from API
```typescript
// Get all plans
const response = await ApiService.makeAuthenticatedCall('/api/plans', {
  method: 'GET',
});

// Get plans by type
const freedomPlans = await ApiService.makeAuthenticatedCall(
  '/api/plans?type=freedom',
  { method: 'GET' }
);
```

### 3. Use Plan Cards

#### Freedom Plans
```tsx
<FreedomPlanCard
  plans={freedomPlans}
  onPlanSelect={(plan) => console.log('Selected:', plan)}
  selectedPlanId={selectedPlanId}
/>
```

#### Core Courses
```tsx
<CorePlanCard
  plans={corePlans}
  onPlanSelect={(plan) => navigateToCheckout(plan)}
  selectedPlanId={selectedPlanId}
/>
```

#### Kids Programs
```tsx
<KidsPlanCard
  plans={kidsPlans}
  onPlanSelect={(plan) => handleKidsPlanSelect(plan)}
  selectedPlanId={selectedPlanId}
/>
```

### 4. Use Complete Plans Screen
```tsx
import { AllPlansScreen } from '@/app/components';

// In your navigation
<Stack.Screen name="AllPlans" component={AllPlansScreen} />
```

## 📊 Database Queries

### Get Plans by Type
```sql
-- Freedom Plans
SELECT * FROM plans WHERE plan_type = 'freedom' ORDER BY price;

-- Core Courses
SELECT * FROM plans WHERE plan_type = 'core' ORDER BY price;

-- Kids Programs
SELECT * FROM plans WHERE plan_type = 'kids' ORDER BY price;

-- All with details
SELECT 
  id, name, plan_type, price, original_price,
  ai_minutes, validity_months, is_popular
FROM plans
ORDER BY plan_type, price;
```

### Get Plan with Installments
```sql
SELECT 
  p.*,
  p.installment_options->>'options' as payment_options
FROM plans p
WHERE p.plan_type = 'professional'
  AND p.installment_options IS NOT NULL;
```

## 🎨 Color Scheme Reference

### Freedom Plans
- Basic: `['#10B981', '#059669']` (Green)
- Growth: `['#3B82F6', '#1D4ED8']` (Blue)
- Intensive: `['#8B5CF6', '#6D28D9']` (Purple)

### Core Courses
- Silver: `['#9CA3AF', '#6B7280']` (Gray)
- Gold: `['#F59E0B', '#D97706']` (Orange/Gold)
- Diamond: `['#8B5CF6', '#6D28D9']` (Purple)
- DELCA: `['#DC2626', '#B91C1C']` (Red)

### Kids Programs
- Story Basket: `['#F472B6', '#EC4899']` (Pink)
- Grammar Garden: `['#34D399', '#10B981']` (Green)

## 🔧 Customization Examples

### Add Custom Badge
```typescript
// In plan card component
{plan.customBadge && (
  <View style={styles.customBadge}>
    <Text style={styles.customBadgeText}>
      {plan.customBadge}
    </Text>
  </View>
)}
```

### Filter by Price Range
```typescript
const affordablePlans = allPlans.filter(
  plan => plan.price >= 399 && plan.price <= 799
);
```

### Sort by Popularity
```typescript
const sortedPlans = [...plans].sort((a, b) => {
  if (a.isPopular && !b.isPopular) return -1;
  if (!a.isPopular && b.isPopular) return 1;
  return a.price - b.price;
});
```

## 🐛 Common Issues & Solutions

### Issue: Plans not loading
**Solution**: Check if backend is running on port 3000
```bash
cd backend
node server.js
```

### Issue: TypeScript errors
**Solution**: Ensure plan objects have all required fields
```typescript
interface Plan {
  id: string;
  name: string;
  price: number;
  // ... all required fields
  isPopular: boolean; // Must be boolean, not undefined
  description: string; // Must be string, not undefined
}
```

### Issue: Gradients not showing
**Solution**: Install expo-linear-gradient
```bash
npx expo install expo-linear-gradient
```

## 📱 Navigation Integration

### Add to Tab Navigator
```typescript
import { AllPlansScreen } from '@/app/components';

<Tab.Screen 
  name="Plans" 
  component={AllPlansScreen}
  options={{
    title: 'Choose Plan',
    tabBarIcon: ({ color }) => <Icon name="list" color={color} />
  }}
/>
```

### Navigate from Onboarding
```typescript
navigation.navigate('AllPlans', {
  preselectedCategory: 'freedom',
  highlightPopular: true
});
```

## 🧪 Testing Checklist

### Manual Testing
- [ ] All 14 plans display correctly
- [ ] Tabs switch smoothly
- [ ] Cards scroll horizontally
- [ ] Selection works (blue border appears)
- [ ] Prices calculate savings correctly
- [ ] Gradients render on all devices
- [ ] Loading spinner shows during fetch
- [ ] Error handling works (offline test)

### API Testing
```bash
# Test plans endpoint
curl http://localhost:3000/api/plans

# Test filtered plans
curl http://localhost:3000/api/plans?type=freedom
curl http://localhost:3000/api/plans?type=core
curl http://localhost:3000/api/plans?type=kids
```

## 📚 Next Steps (Week 2)

1. **Implement Checkout Flow**
   - Connect plan cards to checkout
   - Pass selected plan data
   - Handle installment selection

2. **Add Razorpay Integration**
   - One-time payments
   - Installment payments
   - Auto-pay subscriptions

3. **Build Payment Tracking**
   - Payment history screen
   - Installment status display
   - Receipt generation

---

**Quick Start**: Import `AllPlansScreen` and add it to your navigation stack. It handles everything automatically!
