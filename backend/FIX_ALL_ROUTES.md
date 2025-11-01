# Route Fixes Needed

All routes that call database methods need to be async and use `await`.

## Files to Fix:
1. routes/user.js - All db.updateUser, db.findUserById calls
2. routes/plans.js - All db.getAllPlans, db.getPlanById calls  
3. routes/coupons.js - All db.validateCoupon calls
4. routes/payments.js - All db.createPayment, db.getPayment calls
5. routes/membership.js - All db.createMembership calls

The middleware verifySession also needs to be async since it calls db.findSessionByToken and db.findSessionById
