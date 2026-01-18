$authUrl = 'http://localhost:6000'
$payUrl = 'http://localhost:5001'

# Paths to projects (adjust if workspace differs)
$authPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\Auth_service\Online-Food-Delivery-System-Authentication--Backend-Carlos"
$paymentPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\payment_service\backend"

Write-Output "Starting Auth and Payment services as background jobs"
Start-Job -Name AuthService -ScriptBlock { param($path) Set-Location $path; $env:ASPNETCORE_ENVIRONMENT='Development'; $env:ASPNETCORE_URLS='http://localhost:6000'; $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'; $env:JwtSettings__Issuer='FoodDeliverySystem'; $env:JwtSettings__Audience='FoodDeliveryClients'; dotnet run --project .\FoodDeliverySystem.Auth.csproj --urls http://localhost:6000 } -ArgumentList $authPath | Out-Null
Start-Job -Name PaymentService -ScriptBlock { param($path) Set-Location $path; $env:ASPNETCORE_ENVIRONMENT='Production'; $env:ASPNETCORE_URLS='http://localhost:5001'; $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'; $env:JwtSettings__Issuer='FoodDeliverySystem'; $env:JwtSettings__Audience='FoodDeliveryClients'; dotnet run --no-launch-profile --project .\PaymentService.csproj --urls http://localhost:5001 } -ArgumentList $paymentPath | Out-Null

# Wait for services to be reachable
function Wait-ForUrl($url, $timeoutSec = 30){ $t = [DateTime]::UtcNow.AddSeconds($timeoutSec); while ([DateTime]::UtcNow -lt $t) { try { Invoke-RestMethod -Method Get -Uri "$url/api/health" -ErrorAction Stop; Write-Output "$url is up"; return $true } catch { Start-Sleep -Milliseconds 500 } } Write-Output "Timed out waiting for $url"; return $false }
if (-not (Wait-ForUrl $authUrl 30)) { Write-Output 'Auth did not start'; Receive-Job -Name AuthService -Keep; exit 1 }
if (-not (Wait-ForUrl $payUrl 30)) { Write-Output 'Payment did not start'; Receive-Job -Name PaymentService -Keep; exit 1 }

Write-Output "Checking services..."
try { Invoke-RestMethod -Uri "$authUrl/api/health" -TimeoutSec 5; Write-Output "Auth healthy" } catch { Write-Output ("Auth not reachable: {0}" -f $_.Exception.Message); exit 1 }
try { Invoke-RestMethod -Uri "$payUrl/api/health" -TimeoutSec 5; Write-Output "Payment healthy" } catch { Write-Output ("Payment not reachable: {0}" -f $_.Exception.Message); exit 1 }

# SuperAdmin credentials (seeded by auth service)
$superEmail = 'superadmin@fooddelivery.com'
$superPassword = 'Admin123!'

function Login($email, $password) {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    try {
        $resp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body $body -ContentType 'application/json' -ErrorAction Stop
        return $resp.user.token
    } catch {
        Write-Output (("Login failed for {0}: {1}" -f $email, $_.Exception.Message))
        return $null
    }
}

Write-Output "Logging in as SuperAdmin ($superEmail)"
$superToken = Login $superEmail $superPassword
if (-not $superToken) { Write-Output 'SuperAdmin login failed — cannot create admin'; exit 1 }

# Create an Admin account using SuperAdmin
$adminEmail = "admin+$( [guid]::NewGuid().ToString('N').Substring(0,8) )@example.com"
$adminPayload = @{ fullName = 'Auto Admin'; email = $adminEmail; password = 'Admin123!'; confirmPassword = 'Admin123!' } | ConvertTo-Json
try {
    $createResp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/create/admin" -Headers @{ Authorization = "Bearer $superToken" } -Body $adminPayload -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Create admin response: $($createResp | ConvertTo-Json -Compress)"
} catch {
    Write-Output (("Create admin failed: {0}" -f $_.Exception.Message))
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            Write-Output "Create admin response body:"
            Write-Output $body
            if ($body -like '*SP_CreateAdmin*') {
                Write-Output 'Stored procedure SP_CreateAdmin missing — will use SuperAdmin as admin for subsequent admin calls.'
                $adminToken = $superToken
            }
        } catch {
            Write-Output (("Failed to read error response body: {0}" -f $_.Exception.Message))
        }
    }
    Write-Output "--- AuthService logs ---"
    try { Receive-Job -Name AuthService -Keep -ErrorAction SilentlyContinue | Write-Output } catch {}
    Write-Output "--- PaymentService logs ---"
    try { Receive-Job -Name PaymentService -Keep -ErrorAction SilentlyContinue | Write-Output } catch {}
    if (-not $adminToken) { exit 1 }
}

# Register a new customer
$customerEmail = "cust+$( [guid]::NewGuid().ToString('N').Substring(0,8) )@example.com"
$regPayload = @{ fullName = 'Auto Customer'; email = $customerEmail; password = 'P@ssw0rd!'; confirmPassword = 'P@ssw0rd!' } | ConvertTo-Json
try {
    $regResp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/register/customer" -Body $regPayload -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Register response: $($regResp | ConvertTo-Json -Compress)"
} catch {
    Write-Output (("Register failed: {0}" -f $_.Exception.Message))
    exit 1
}

# Login as admin and customer
Write-Output "Logging in as new admin: $adminEmail"
if (-not $adminToken) {
    $adminToken = Login $adminEmail 'Admin123!'
    if (-not $adminToken) { Write-Output 'Admin login failed'; exit 1 }
} else {
    Write-Output 'Using existing admin token (fallback or created admin)'
}
Write-Output "Admin token: $adminToken"
Write-Output "Admin claims: $(Invoke-Expression "powershell -NoProfile -Command \"$null\"")"
Write-Output "Logging in as new customer: $customerEmail"
$customerToken = Login $customerEmail 'P@ssw0rd!'
if (-not $customerToken) { Write-Output 'Customer login failed'; exit 1 }
Write-Output "Customer token: $customerToken"

# Use payment_service: customer creates top-up
$topupPayload = @{ amount = 50; currency = 'PHP'; paymentMethod = 'mock' } | ConvertTo-Json
try {
    $tresp = Invoke-RestMethod -Method Post -Uri "$payUrl/api/topup" -Headers @{ Authorization = "Bearer $customerToken" } -Body $topupPayload -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Customer topup response: $($tresp | ConvertTo-Json -Compress)"
} catch {
    Write-Output (("Customer topup failed: {0}" -f $_.Exception.Message))
}

# Use payment_service: admin lists refunds (admin-only)
try {
    $rresp = Invoke-RestMethod -Method Get -Uri "$payUrl/api/refunds" -Headers @{ Authorization = "Bearer $adminToken" } -ErrorAction Stop
    Write-Output "Admin refunds list: $($rresp | ConvertTo-Json -Compress)"
} catch {
    Write-Output (("Admin refunds call failed: {0}" -f $_.Exception.Message))
    if ($_.Exception.Response) {
        try {
            $s = $_.Exception.Response.GetResponseStream()
            $r = New-Object System.IO.StreamReader($s)
            $b = $r.ReadToEnd()
            Write-Output "Admin refunds response body:"
            Write-Output $b
        } catch { }
    }
}

Write-Output "Done. Admin: $adminEmail | Customer: $customerEmail"

Write-Output "To view the admin and customer tokens in this session, store them or re-login using the script's Login function."
$authUrl = 'http://localhost:6000'
$payUrl = 'http://localhost:5001'

# Paths to projects (adjust if workspace differs)
$authPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\Auth_service\Online-Food-Delivery-System-Authentication--Backend-Carlos"
$paymentPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\payment_service\backend"

Write-Output "Starting Auth and Payment services as background jobs"
Start-Job -Name AuthService -ScriptBlock { param($path) Set-Location $path; $env:ASPNETCORE_ENVIRONMENT='Development'; $env:ASPNETCORE_URLS='http://localhost:6000'; $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'; $env:JwtSettings__Issuer='FoodDeliverySystem'; $env:JwtSettings__Audience='FoodDeliveryClients'; dotnet run --project .\FoodDeliverySystem.Auth.csproj --urls http://localhost:6000 } -ArgumentList $authPath | Out-Null
Start-Job -Name PaymentService -ScriptBlock { param($path) Set-Location $path; $env:ASPNETCORE_ENVIRONMENT='Production'; $env:ASPNETCORE_URLS='http://localhost:5001'; $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'; $env:JwtSettings__Issuer='FoodDeliverySystem'; $env:JwtSettings__Audience='FoodDeliveryClients'; dotnet run --no-launch-profile --project .\PaymentService.csproj --urls http://localhost:5001 } -ArgumentList $paymentPath | Out-Null

# Wait for services to be reachable
function Wait-ForUrl($url, $timeoutSec = 30){ $t = [DateTime]::UtcNow.AddSeconds($timeoutSec); while ([DateTime]::UtcNow -lt $t) { try { Invoke-RestMethod -Method Get -Uri "$url/api/health" -ErrorAction Stop; Write-Output "$url is up"; return $true } catch { Start-Sleep -Milliseconds 500 } } Write-Output "Timed out waiting for $url"; return $false }
if (-not (Wait-ForUrl $authUrl 30)) { Write-Output 'Auth did not start'; Receive-Job -Name AuthService -Keep; exit 1 }
if (-not (Wait-ForUrl $payUrl 30)) { Write-Output 'Payment did not start'; Receive-Job -Name PaymentService -Keep; exit 1 }

Write-Output "Checking services..."
try { Invoke-RestMethod -Uri "$authUrl/api/health" -TimeoutSec 5; Write-Output "Auth healthy" } catch { Write-Output ("Auth not reachable: {0}" -f $_.Exception.Message); exit 1 }
try { Invoke-RestMethod -Uri "$payUrl/api/health" -TimeoutSec 5; Write-Output "Payment healthy" } catch { Write-Output ("Payment not reachable: {0}" -f $_.Exception.Message); exit 1 }

# SuperAdmin credentials (seeded by auth service)
$superEmail = 'superadmin@fooddelivery.com'
$superPassword = 'Admin123!'

function Login($email, $password) {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    try {
        $resp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body $body -ContentType 'application/json' -ErrorAction Stop
        return $resp.user.token
    } catch {
        Write-Output ("Login failed for {0}: {1}" -f $email, $_.Exception.Message)
        return $null
    }
}

# Helper to decode JWT payload (base64url -> JSON)
function DecodeToken($token) {
    if (-not $token) { return $null }
    $parts = $token.Split('.')
    if ($parts.Count -lt 2) { return $null }
    $payload = $parts[1]
    $b64 = $payload.Replace('-','+').Replace('_','/')
    switch ($b64.Length % 4) { 0 { } 2 { $b64 += '==' } 3 { $b64 += '=' } default { $b64 += '===' } }
    try {
        $json = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
        return $json
    } catch { return $null }
}

Write-Output "Logging in as SuperAdmin ($superEmail)"
$superToken = Login $superEmail $superPassword
if (-not $superToken) { Write-Output 'SuperAdmin login failed — cannot create admin'; exit 1 }
Write-Output "Super token: $superToken"
Write-Output "Super claims: $(DecodeToken $superToken)"

# Create an Admin account using SuperAdmin
$adminEmail = "admin+$( [guid]::NewGuid().ToString('N').Substring(0,8) )@example.com"
$adminPayload = @{ fullName = 'Auto Admin'; email = $adminEmail; password = 'Admin123!'; confirmPassword = 'Admin123!' } | ConvertTo-Json
try {
    $createResp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/create/admin" -Headers @{ Authorization = "Bearer $superToken" } -Body $adminPayload -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Create admin response: $($createResp | ConvertTo-Json -Compress)"
} catch {
    Write-Output ("Create admin failed: {0}" -f $_.Exception.Message)
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            Write-Output "Create admin response body:"
            Write-Output $body
            if ($body -like '*SP_CreateAdmin*') {
                Write-Output 'Stored procedure SP_CreateAdmin missing — will use SuperAdmin as admin for subsequent admin calls.'
                $adminToken = $superToken
            }
        } catch {
            Write-Output ("Failed to read error response body: {0}" -f $_.Exception.Message)
        }
    }
    Write-Output "--- AuthService logs ---"
    try { Receive-Job -Name AuthService -Keep -ErrorAction SilentlyContinue | Write-Output } catch {}
    Write-Output "--- PaymentService logs ---"
    try { Receive-Job -Name PaymentService -Keep -ErrorAction SilentlyContinue | Write-Output } catch {}
    # continue if we set $adminToken to superToken, otherwise exit
    if (-not $adminToken) { exit 1 }
}

# Register a new customer
$customerEmail = "cust+$( [guid]::NewGuid().ToString('N').Substring(0,8) )@example.com"
$regPayload = @{ fullName = 'Auto Customer'; email = $customerEmail; password = 'P@ssw0rd!'; confirmPassword = 'P@ssw0rd!' } | ConvertTo-Json
try {
    $regResp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/register/customer" -Body $regPayload -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Register response: $($regResp | ConvertTo-Json -Compress)"
} catch {
    Write-Output ("Register failed: {0}" -f $_.Exception.Message)
    exit 1
}

# Login as admin and customer
Write-Output "Logging in as new admin: $adminEmail"
# If CreateAdmin failed earlier we may have set $adminToken to the SuperAdmin fallback.
# Only attempt to login and overwrite $adminToken if it is not already set.
if (-not $adminToken) {
    $adminToken = Login $adminEmail 'Admin123!'
    if (-not $adminToken) { Write-Output 'Admin login failed'; exit 1 }
} else {
    Write-Output 'Using existing admin token (fallback or created admin)'
}
Write-Output "Admin token: $adminToken"
Write-Output "Admin claims: $(DecodeToken $adminToken)"
Write-Output "Logging in as new customer: $customerEmail"
$customerToken = Login $customerEmail 'P@ssw0rd!'
if (-not $customerToken) { Write-Output 'Customer login failed'; exit 1 }
Write-Output "Customer token: $customerToken"
Write-Output "Customer claims: $(DecodeToken $customerToken)"

# Use payment_service: customer creates top-up
$topupPayload = @{ amount = 50; currency = 'PHP'; paymentMethod = 'mock' } | ConvertTo-Json
try {
    $tresp = Invoke-RestMethod -Method Post -Uri "$payUrl/api/topup" -Headers @{ Authorization = "Bearer $customerToken" } -Body $topupPayload -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Customer topup response: $($tresp | ConvertTo-Json -Compress)"
} catch {
    Write-Output ("Customer topup failed: {0}" -f $_.Exception.Message)
}

# Use payment_service: admin lists refunds (admin-only)
try {
    $rresp = Invoke-RestMethod -Method Get -Uri "$payUrl/api/refunds" -Headers @{ Authorization = "Bearer $adminToken" } -ErrorAction Stop
    Write-Output "Admin refunds list: $($rresp | ConvertTo-Json -Compress)"
} catch {
    Write-Output ("Admin refunds call failed: {0}" -f $_.Exception.Message)
    if ($_.Exception.Response) {
        try {
            $s = $_.Exception.Response.GetResponseStream()
            $r = New-Object System.IO.StreamReader($s)
            $b = $r.ReadToEnd()
            Write-Output "Admin refunds response body:"
            Write-Output $b
        } catch { }
    }
}

Write-Output "Done. Admin: $adminEmail | Customer: $customerEmail"

Write-Output "To view the admin and customer tokens in this session, store them or re-login using the script's Login function."
