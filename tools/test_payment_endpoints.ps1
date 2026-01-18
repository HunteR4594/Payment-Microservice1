# Test payment service endpoints: orders, dashboard, refunds, topup, wallet
param()

$authPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\Auth_service\Online-Food-Delivery-System-Authentication--Backend-Carlos"
$paymentPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\payment_service\backend"

$authUrl = 'http://localhost:6000'
$payUrl = 'http://localhost:5001'

function Wait-ForUrl($url, $timeoutSec = 30){ $t = [DateTime]::UtcNow.AddSeconds($timeoutSec); while ([DateTime]::UtcNow -lt $t) { try { Invoke-RestMethod -Method Get -Uri "$url/api/health" -ErrorAction Stop; return $true } catch { Start-Sleep -Milliseconds 500 } } return $false }

Write-Output "Starting services (background jobs)"
Start-Job -Name AuthService -ScriptBlock { param($path) Set-Location $path; $env:ASPNETCORE_ENVIRONMENT='Development'; $env:ASPNETCORE_URLS='http://localhost:6000'; $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'; dotnet run --project .\FoodDeliverySystem.Auth.csproj --urls http://localhost:6000 } -ArgumentList $authPath | Out-Null
Start-Job -Name PaymentService -ScriptBlock { param($path) Set-Location $path; $env:ASPNETCORE_ENVIRONMENT='Production'; $env:ASPNETCORE_URLS='http://localhost:5001'; $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'; dotnet run --no-launch-profile --project .\PaymentService.csproj --urls http://localhost:5001 } -ArgumentList $paymentPath | Out-Null

if (-not (Wait-ForUrl $authUrl 40)) { Write-Output 'Auth did not start'; Receive-Job -Name AuthService -Keep; exit 1 }
if (-not (Wait-ForUrl $payUrl 40)) { Write-Output 'Payment did not start'; Receive-Job -Name PaymentService -Keep; exit 1 }

Write-Output 'Services up'

function Login($email,$password){
    try {
        $resp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body (@{ email=$email; password=$password } | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
        return $resp.user.token
    } catch {
        Write-Output (("Login failed {0}: {1}" -f $email, $_.Exception.Message))
        return $null
    }
}

# SuperAdmin
$superEmail='superadmin@fooddelivery.com'; $superPass='Admin123!'
$superToken = Login $superEmail $superPass
if (-not $superToken) { Write-Output 'SuperAdmin login failed'; Receive-Job -Name AuthService -Keep; exit 1 }

# Create test customer
$custEmail = "cust+$( [guid]::NewGuid().ToString('N').Substring(0,8) )@example.com"
$reg = @{ fullName='Test Customer'; email=$custEmail; password='P@ssw0rd!'; confirmPassword='P@ssw0rd!' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/register/customer" -Body $reg -ContentType 'application/json' -ErrorAction Stop | Out-Null
$custToken = Login $custEmail 'P@ssw0rd!'
if (-not $custToken) { Write-Output 'Customer login failed'; exit 1 }

Write-Output "Customer token length: $($custToken.Length)"

# 1) Top-up: create and complete
$topup = @{ amount=150; currency='PHP'; paymentMethod='mock' } | ConvertTo-Json
$tresp = Invoke-RestMethod -Method Post -Uri "$payUrl/api/topup" -Headers @{ Authorization = "Bearer $custToken" } -Body $topup -ContentType 'application/json'
Write-Output "Topup create: $($tresp | ConvertTo-Json -Compress)"
$topId = $tresp.data.id

Invoke-RestMethod -Method Post -Uri "$payUrl/api/topup/$topId/complete" -Headers @{ Authorization = "Bearer $custToken" } -ErrorAction Stop | Out-Null
Write-Output "Topup $topId completed"

# Check wallet
$w = Invoke-RestMethod -Method Get -Uri "$payUrl/api/wallet" -Headers @{ Authorization = "Bearer $custToken" } -ErrorAction Stop
Write-Output "Wallet: $($w | ConvertTo-Json -Compress)"

# 2) Create order (use wallet payment now that balance exists)
$orderReq = @{
    items = @(
        @{ name = 'Burger'; quantity = 1; price = 50.0 }
    );
    branch = 'TestBranch';
    paymentMethod = 'wallet'
} | ConvertTo-Json
$ord = Invoke-RestMethod -Method Post -Uri "$payUrl/api/orders" -Headers @{ Authorization = "Bearer $custToken" } -Body $orderReq -ContentType 'application/json'
Write-Output "Order created: $($ord | ConvertTo-Json -Compress)"
$orderId = $ord.data.id

# Get order
$got = Invoke-RestMethod -Method Get -Uri "$payUrl/api/orders/$orderId" -Headers @{ Authorization = "Bearer $custToken" }
Write-Output "Get order: $($got | ConvertTo-Json -Compress)"

# 3) Refunds: create refund as customer
$refundReq = @{ orderId = $orderId; amount = 50; reason = 'Test refund' } | ConvertTo-Json
$rCreate = Invoke-RestMethod -Method Post -Uri "$payUrl/api/refunds" -Headers @{ Authorization = "Bearer $custToken" } -Body $refundReq -ContentType 'application/json'
Write-Output "Refund created: $($rCreate | ConvertTo-Json -Compress)"

# 4) Admin: list refunds
$rList = Invoke-RestMethod -Method Get -Uri "$payUrl/api/refunds" -Headers @{ Authorization = "Bearer $superToken" }
Write-Output "Admin refunds: $($rList | ConvertTo-Json -Compress)"

# 5) Dashboard: customer and admin
try { $dbCust = Invoke-RestMethod -Method Get -Uri "$payUrl/api/dashboard/stats" -Headers @{ Authorization = "Bearer $custToken" }; Write-Output "Dashboard (customer): $($dbCust | ConvertTo-Json -Compress)" } catch { Write-Output "Dashboard (customer) failed: $($_.Exception.Message)" }
try { $dbAdmin = Invoke-RestMethod -Method Get -Uri "$payUrl/api/dashboard/stats?userId=$($custEmail)" -Headers @{ Authorization = "Bearer $superToken" }; Write-Output "Dashboard (admin for user): $($dbAdmin | ConvertTo-Json -Compress)" } catch { Write-Output "Dashboard (admin) failed: $($_.Exception.Message)" }

# 6) Wallet admin actions: add balance
try {
    $addBal = @{ amount = 200; description = 'Admin credit for test' } | ConvertTo-Json
    Invoke-RestMethod -Method Put -Uri "$payUrl/api/wallet/$($custEmail)/balance" -Headers @{ Authorization = "Bearer $superToken" } -Body $addBal -ContentType 'application/json' -ErrorAction Stop | Out-Null
    Write-Output "Admin added balance to $custEmail"
} catch { Write-Output "Add balance failed: $($_.Exception.Message)" }

# View transactions
try { $tx = Invoke-RestMethod -Method Get -Uri "$payUrl/api/wallet/transactions" -Headers @{ Authorization = "Bearer $custToken" }; Write-Output "Transactions: $($tx | ConvertTo-Json -Compress)" } catch { Write-Output "Transactions fetch failed: $($_.Exception.Message)" }

Write-Output 'Test sequence complete.'
Write-Output 'Jobs status:'
Get-Job -Name AuthService,PaymentService | Select-Object Id,Name,State,HasMoreData | Format-Table -AutoSize
# Test payment service endpoints: orders, dashboard, refunds, topup, wallet
param()

$authPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\Auth_service\Online-Food-Delivery-System-Authentication--Backend-Carlos"
$paymentPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\payment_service\backend"

$authUrl = 'http://localhost:6000'
$payUrl = 'http://localhost:5001'

function Wait-ForUrl($url, $timeoutSec = 30){ $t = [DateTime]::UtcNow.AddSeconds($timeoutSec); while ([DateTime]::UtcNow -lt $t) { try { Invoke-RestMethod -Method Get -Uri "$url/api/health" -ErrorAction Stop; return $true } catch { Start-Sleep -Milliseconds 500 } } return $false }

Write-Output "Starting services (background jobs)"
Start-Job -Name AuthService -ScriptBlock { param($path) Set-Location $path; $env:ASPNETCORE_ENVIRONMENT='Development'; $env:ASPNETCORE_URLS='http://localhost:6000'; $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'; dotnet run --project .\FoodDeliverySystem.Auth.csproj --urls http://localhost:6000 } -ArgumentList $authPath | Out-Null
Start-Job -Name PaymentService -ScriptBlock { param($path) Set-Location $path; $env:ASPNETCORE_ENVIRONMENT='Production'; $env:ASPNETCORE_URLS='http://localhost:5001'; $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'; dotnet run --no-launch-profile --project .\PaymentService.csproj --urls http://localhost:5001 } -ArgumentList $paymentPath | Out-Null

if (-not (Wait-ForUrl $authUrl 40)) { Write-Output 'Auth did not start'; Receive-Job -Name AuthService -Keep; exit 1 }
if (-not (Wait-ForUrl $payUrl 40)) { Write-Output 'Payment did not start'; Receive-Job -Name PaymentService -Keep; exit 1 }

Write-Output 'Services up'

function Login($email,$password){
	try {
		$resp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body (@{ email=$email; password=$password } | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
		return $resp.user.token
	} catch {
		Write-Output ("Login failed {0}: {1}" -f $email, $_.Exception.Message)
		return $null
	}
}

# SuperAdmin
$superEmail='superadmin@fooddelivery.com'; $superPass='Admin123!'
$superToken = Login $superEmail $superPass
if (-not $superToken) { Write-Output 'SuperAdmin login failed'; Receive-Job -Name AuthService -Keep; exit 1 }

# Create test customer
$custEmail = "cust+$( [guid]::NewGuid().ToString('N').Substring(0,8) )@example.com"
$reg = @{ fullName='Test Customer'; email=$custEmail; password='P@ssw0rd!'; confirmPassword='P@ssw0rd!' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/register/customer" -Body $reg -ContentType 'application/json' -ErrorAction Stop | Out-Null
$custToken = Login $custEmail 'P@ssw0rd!'
if (-not $custToken) { Write-Output 'Customer login failed'; exit 1 }

Write-Output "Customer token length: $($custToken.Length)"

# 1) Top-up: create and complete
$topup = @{ amount=150; currency='PHP'; paymentMethod='mock' } | ConvertTo-Json
$tresp = Invoke-RestMethod -Method Post -Uri "$payUrl/api/topup" -Headers @{ Authorization = "Bearer $custToken" } -Body $topup -ContentType 'application/json'
Write-Output "Topup create: $($tresp | ConvertTo-Json -Compress)"
$topId = $tresp.data.id

Invoke-RestMethod -Method Post -Uri "$payUrl/api/topup/$topId/complete" -Headers @{ Authorization = "Bearer $custToken" } -ErrorAction Stop | Out-Null
Write-Output "Topup $topId completed"

# Check wallet
$w = Invoke-RestMethod -Method Get -Uri "$payUrl/api/wallet" -Headers @{ Authorization = "Bearer $custToken" } -ErrorAction Stop
Write-Output "Wallet: $($w | ConvertTo-Json -Compress)"

$orderReq = @{
	items = @(
		@{ name = 'Burger'; quantity = 1; price = 50.0 }
	);
	branch = 'TestBranch';
	paymentMethod = 'wallet'
} | ConvertTo-Json
$ord = Invoke-RestMethod -Method Post -Uri "$payUrl/api/orders" -Headers @{ Authorization = "Bearer $custToken" } -Body $orderReq -ContentType 'application/json'
Write-Output "Order created: $($ord | ConvertTo-Json -Compress)"
$orderId = $ord.data.id

# Get order
$got = Invoke-RestMethod -Method Get -Uri "$payUrl/api/orders/$orderId" -Headers @{ Authorization = "Bearer $custToken" }
Write-Output "Get order: $($got | ConvertTo-Json -Compress)"

# 3) Refunds: create refund as customer
$refundReq = @{ orderId = $orderId; amount = 50; reason = 'Test refund' } | ConvertTo-Json
$rCreate = Invoke-RestMethod -Method Post -Uri "$payUrl/api/refunds" -Headers @{ Authorization = "Bearer $custToken" } -Body $refundReq -ContentType 'application/json'
Write-Output "Refund created: $($rCreate | ConvertTo-Json -Compress)"

# 4) Admin: list refunds
$rList = Invoke-RestMethod -Method Get -Uri "$payUrl/api/refunds" -Headers @{ Authorization = "Bearer $superToken" }
Write-Output "Admin refunds: $($rList | ConvertTo-Json -Compress)"

# 5) Dashboard: customer and admin
$dbCust = Invoke-RestMethod -Method Get -Uri "$payUrl/api/dashboard/stats" -Headers @{ Authorization = "Bearer $custToken" }
Write-Output "Dashboard (customer): $($dbCust | ConvertTo-Json -Compress)"
$dbAdmin = Invoke-RestMethod -Method Get -Uri "$payUrl/api/dashboard/stats?userId=$($custEmail)" -Headers @{ Authorization = "Bearer $superToken" }
Write-Output "Dashboard (admin for user): $($dbAdmin | ConvertTo-Json -Compress)"

# 6) Wallet admin actions: add balance
$addBal = @{ amount = 200; description = 'Admin credit for test' } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri "$payUrl/api/wallet/$($custEmail)/balance" -Headers @{ Authorization = "Bearer $superToken" } -Body $addBal -ContentType 'application/json' -ErrorAction Stop | Out-Null
Write-Output "Admin added balance to $custEmail"

# View transactions
$tx = Invoke-RestMethod -Method Get -Uri "$payUrl/api/wallet/transactions" -Headers @{ Authorization = "Bearer $custToken" }
Write-Output "Transactions: $($tx | ConvertTo-Json -Compress)"

Write-Output 'Test sequence complete.'
Write-Output 'Jobs status:'
Get-Job -Name AuthService,PaymentService | Select-Object Id,Name,State,HasMoreData | Format-Table -AutoSize
