# API Test Script
# Test all endpoints to ensure they work correctly with PostgreSQL

Write-Host "================================" -ForegroundColor Cyan
Write-Host " API Testing Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$testPassed = 0
$testFailed = 0

# Helper function to test API
function Test-API {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host " ✅ PASSED" -ForegroundColor Green
        $script:testPassed++
        return $response
    }
    catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
        $script:testFailed++
        return $null
    }
}

Write-Host "1. Testing Health Endpoint" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Gray
$health = Test-API -Name "GET /api/health" -Url "$baseUrl/api/health"
Write-Host ""

Write-Host "2. Testing Plans Endpoints" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Gray
$plans = Test-API -Name "GET /api/plans" -Url "$baseUrl/api/plans"
if ($plans -and $plans.plans) {
    Write-Host "   Found $($plans.plans.Count) plans" -ForegroundColor Cyan
    $plans.plans | ForEach-Object {
        Write-Host "   - $($_.name): ₹$($_.price)" -ForegroundColor Gray
    }
}
Write-Host ""

Write-Host "3. Testing User Registration" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Gray
$registerBody = @{
    mobileNumber = "9876543210"
    name = "Test User"
}
$register = Test-API -Name "POST /api/auth/register" -Url "$baseUrl/api/auth/register" -Method POST -Body $registerBody

$token = $null
if ($register -and $register.token) {
    $token = $register.token
    Write-Host "   User created with token: $($token.Substring(0,20))..." -ForegroundColor Cyan
}
Write-Host ""

Write-Host "4. Testing Login" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Gray
$loginBody = @{
    mobileNumber = "9876543210"
    otp = "1234"
}
$login = Test-API -Name "POST /api/auth/login" -Url "$baseUrl/api/auth/login" -Method POST -Body $loginBody
if ($login -and $login.token) {
    $token = $login.token
    Write-Host "   Logged in with token: $($token.Substring(0,20))..." -ForegroundColor Cyan
}
Write-Host ""

if ($token) {
    Write-Host "5. Testing User Profile Updates" -ForegroundColor Yellow
    Write-Host "----------------------------" -ForegroundColor Gray
    
    # Test English Level Update
    $levelBody = @{
        token = $token
        level = "Intermediate"
    }
    Test-API -Name "PUT /api/user/english-level" -Url "$baseUrl/api/user/english-level" -Method PUT -Body $levelBody
    
    # Test Learning Goals Update
    $goalsBody = @{
        token = $token
        goals = @("Career", "Travel")
    }
    Test-API -Name "PUT /api/user/learning-goals" -Url "$baseUrl/api/user/learning-goals" -Method PUT -Body $goalsBody
    
    # Test Skills Focus Update
    $skillsBody = @{
        token = $token
        skills = @("Speaking", "Listening")
    }
    Test-API -Name "PUT /api/user/skills-focus" -Url "$baseUrl/api/user/skills-focus" -Method PUT -Body $skillsBody
    
    # Test Speaking Partner Update
    $partnerBody = @{
        token = $token
        needsPartner = "yes"
    }
    Test-API -Name "PUT /api/user/speaking-partner" -Url "$baseUrl/api/user/speaking-partner" -Method PUT -Body $partnerBody
    Write-Host ""
}

Write-Host "6. Testing Coupon Validation" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Gray
$couponBody = @{
    code = "WELCOME50"
}
$coupon = Test-API -Name "POST /api/coupons/validate (WELCOME50)" -Url "$baseUrl/api/coupons/validate" -Method POST -Body $couponBody
if ($coupon -and $coupon.valid) {
    Write-Host "   Coupon valid: $($coupon.discountType) - ₹$($coupon.discountValue)" -ForegroundColor Cyan
}

$couponBody2 = @{
    code = "SAVE100"
}
$coupon2 = Test-API -Name "POST /api/coupons/validate (SAVE100)" -Url "$baseUrl/api/coupons/validate" -Method POST -Body $couponBody2
if ($coupon2 -and $coupon2.valid) {
    Write-Host "   Coupon valid: $($coupon2.discountType) - ₹$($coupon2.discountValue)" -ForegroundColor Cyan
}
Write-Host ""

if ($token -and $plans -and $plans.plans.Count -gt 0) {
    Write-Host "7. Testing Payment Processing" -ForegroundColor Yellow
    Write-Host "----------------------------" -ForegroundColor Gray
    
    $planId = $plans.plans[0].id
    $paymentBody = @{
        token = $token
        planId = $planId
        couponCode = "WELCOME50"
    }
    $payment = Test-API -Name "POST /api/payments/process" -Url "$baseUrl/api/payments/process" -Method POST -Body $paymentBody
    
    if ($payment -and $payment.orderId) {
        Write-Host "   Payment created: Order ID $($payment.orderId)" -ForegroundColor Cyan
        
        # Test Payment Status
        Start-Sleep -Seconds 1
        $paymentStatus = Test-API -Name "GET /api/payments/:id/status" -Url "$baseUrl/api/payments/$($payment.orderId)/status"
        if ($paymentStatus) {
            Write-Host "   Payment status: $($paymentStatus.status)" -ForegroundColor Cyan
        }
    }
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host " Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testFailed" -ForegroundColor Red
Write-Host ""

if ($testFailed -eq 0) {
    Write-Host "🎉 All tests passed! Backend is working correctly with PostgreSQL." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please check the backend logs." -ForegroundColor Yellow
}
