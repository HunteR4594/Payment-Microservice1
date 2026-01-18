# Run end-to-end test for Auth_service and payment_service
# Usage: Run from repo root in PowerShell: .\tools\run-e2e.ps1

param()

function Stop-PortProcess($port){
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns | Select-Object -Expand OwningProcess -Unique
        foreach ($procId in $pids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction Stop
                Write-Output ("Stopped process {0} on port {1}" -f $procId, $port)
            } catch {
                Write-Output ("Could not stop {0}: {1}" -f $procId, $_.Exception.Message)
            }
        }
    } else { Write-Output "No process on port $port" }
}

$authPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\Auth_service\Online-Food-Delivery-System-Authentication--Backend-Carlos"
$paymentPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\payment_service\backend"

Write-Output "Stopping possible processes on ports 6000,5001,5000"
Stop-PortProcess 6000
Stop-PortProcess 5001
Stop-PortProcess 5000

Write-Output "Starting Auth_service on http://localhost:6000"
$authJob = Start-Job -Name AuthService -ScriptBlock {
    param($path)
    Set-Location $path
    $env:ASPNETCORE_ENVIRONMENT = 'Development'
    $env:ASPNETCORE_URLS = 'http://localhost:6000'
    $env:JWT_SECRET = 'YourSuperSecretKeyHereAtLeast32CharactersLong!'
    dotnet run --project .\FoodDeliverySystem.Auth.csproj --urls http://localhost:6000
} -ArgumentList $authPath

Write-Output "Starting payment_service on http://localhost:5001"
$payJob = Start-Job -Name PaymentService -ScriptBlock {
    param($path)
    Set-Location $path
    $env:ASPNETCORE_URLS = 'http://localhost:5001'
    $env:JWT_SECRET = 'YourSuperSecretKeyHereAtLeast32CharactersLong!'
    dotnet run --project .\PaymentService.csproj --urls http://localhost:5001
} -ArgumentList $paymentPath

function Wait-ForUrl($url, $timeoutSec = 20){
    $t = [DateTime]::UtcNow.AddSeconds($timeoutSec)
    while ([DateTime]::UtcNow -lt $t) {
        try {
            $r = Invoke-RestMethod -Method Get -Uri "$url/api/health" -ErrorAction Stop
            Write-Output "$url is up"
            return $true
        } catch { Start-Sleep -Milliseconds 500 }
    }
    Write-Output "Timed out waiting for $url"
    return $false
}

$authUrl = 'http://localhost:6000'
$payUrl = 'http://localhost:5001'

if (-not (Wait-ForUrl $authUrl 30)) { Write-Output 'Auth_service did not start' }
if (-not (Wait-ForUrl $payUrl 30)) { Write-Output 'payment_service did not start' }

# Generate unique test email to avoid duplicate registration errors
$unique = ([guid]::NewGuid().ToString('N')).Substring(0,8)
$testEmail = "e2e+$unique@example.com"

Write-Output "Registering test user on $authUrl with email $testEmail"
$reg = @{ fullName='E2E User'; email=$testEmail; password='P@ssw0rd!'; confirmPassword='P@ssw0rd!' } | ConvertTo-Json
try {
    $rresp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/register/customer" -Body $reg -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Register response: $($rresp | ConvertTo-Json -Compress)"
} catch {
    Write-Output "Register failed: $($_.Exception.Message)"
}

# Login
$login = @{ email=$testEmail; password='P@ssw0rd!' } | ConvertTo-Json
try {
    $lresp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body $login -ContentType 'application/json' -ErrorAction Stop
    $token = $lresp.user.token
    Write-Output "Login succeeded, token length: $($token.Length)"
} catch {
    Write-Output "Login failed: $($_.Exception.Message)"; exit 1
}

# Call payment service
$topup = @{ amount=100; currency='PHP'; paymentMethod='mock' } | ConvertTo-Json
try {
    $tresp = Invoke-RestMethod -Method Post -Uri "$payUrl/api/topup" -Headers @{ Authorization = "Bearer $token" } -Body $topup -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Topup response: $($tresp | ConvertTo-Json -Compress)"
} catch {
    Write-Output "Topup failed: $($_.Exception.Message)"; exit 1
}

Write-Output "E2E test complete.\nAuth job status:"
Get-Job -Name AuthService | Select-Object Id,Name,State,HasMoreData | Format-Table -AutoSize
Write-Output "Payment job status:"
Get-Job -Name PaymentService | Select-Object Id,Name,State,HasMoreData | Format-Table -AutoSize

Write-Output "To view logs: Receive-Job -Name AuthService -Keep; Receive-Job -Name PaymentService -Keep"
# Run end-to-end test for Auth_service and payment_service
# Usage: Open PowerShell as developer and run: `.	ools\run-e2e.ps1`
# It will start Auth_service on http://localhost:6000 and payment_service on http://localhost:5001

param()

function Stop-PortProcess($port){
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns | Select-Object -Expand OwningProcess -Unique
        foreach ($procId in $pids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction Stop
                Write-Output ("Stopped process {0} on port {1}" -f $procId, $port)
            } catch {
                Write-Output ("Could not stop {0}: {1}" -f $procId, $_.Exception.Message)
            }
        }
    } else { Write-Output "No process on port $port" }
}

$authPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\Auth_service\Online-Food-Delivery-System-Authentication--Backend-Carlos"
$paymentPath = "c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\payment_service\backend"

Write-Output "Stopping possible processes on ports 6000,5001,5000"
Stop-PortProcess 6000
Stop-PortProcess 5001
Stop-PortProcess 5000

# Start Auth_service as background job
Write-Output "Starting Auth_service on http://localhost:6000"
$authJob = Start-Job -Name AuthService -ScriptBlock {
    param($path)
    Set-Location $path
    $env:ASPNETCORE_ENVIRONMENT = 'Development'
    $env:ASPNETCORE_URLS = 'http://localhost:6000'
    $env:JWT_SECRET = 'YourSuperSecretKeyHereAtLeast32CharactersLong!'
    dotnet run --project .\FoodDeliverySystem.Auth.csproj --urls http://localhost:6000
} -ArgumentList $authPath

# Start payment_service as background job
Write-Output "Starting payment_service on http://localhost:5001"
$payJob = Start-Job -Name PaymentService -ScriptBlock {
    param($path)
    Set-Location $path
    $env:ASPNETCORE_URLS = 'http://localhost:5001'
    $env:JWT_SECRET = 'YourSuperSecretKeyHereAtLeast32CharactersLong!'
    dotnet run --project .\PaymentService.csproj --urls http://localhost:5001
} -ArgumentList $paymentPath

# Wait for health endpoints
function Wait-ForUrl($url, $timeoutSec = 20){
    $t = [DateTime]::UtcNow.AddSeconds($timeoutSec)
    while ([DateTime]::UtcNow -lt $t) {
        try {
            $r = Invoke-RestMethod -Method Get -Uri "$url/api/health" -ErrorAction Stop
            Write-Output "$url is up"
            return $true
        } catch { Start-Sleep -Milliseconds 500 }
    }
    Write-Output "Timed out waiting for $url"
    return $false
}

$authUrl = 'http://localhost:6000'
$payUrl = 'http://localhost:5001'

if (-not (Wait-ForUrl $authUrl 30)) { Write-Output 'Auth_service did not start' }
if (-not (Wait-ForUrl $payUrl 30)) { Write-Output 'payment_service did not start' }

# Generate unique test email to avoid duplicate registration errors
$unique = ([guid]::NewGuid().ToString('N')).Substring(0,8)
$testEmail = "e2e+$unique@example.com"

Write-Output "Registering test user on $authUrl with email $testEmail"
$reg = @{ fullName='E2E User'; email=$testEmail; password='P@ssw0rd!'; confirmPassword='P@ssw0rd!' } | ConvertTo-Json
try {
    $rresp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/register/customer" -Body $reg -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Register response: $($rresp | ConvertTo-Json -Compress)"
} catch {
    Write-Output "Register failed: $($_.Exception.Message)"
}

# Login
$login = @{ email=$testEmail; password='P@ssw0rd!' } | ConvertTo-Json
try {
    $lresp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body $login -ContentType 'application/json' -ErrorAction Stop
    $token = $lresp.user.token
    Write-Output "Login succeeded, token length: $($token.Length)"
} catch {
    Write-Output "Login failed: $($_.Exception.Message)"; exit 1
}

# Call payment service
$topup = @{ amount=100; currency='PHP'; paymentMethod='mock' } | ConvertTo-Json
try {
    $tresp = Invoke-RestMethod -Method Post -Uri "$payUrl/api/topup" -Headers @{ Authorization = "Bearer $token" } -Body $topup -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Topup response: $($tresp | ConvertTo-Json -Compress)"
} catch {
    Write-Output "Topup failed: $($_.Exception.Message)"; exit 1
}

Write-Output "E2E test complete.\nAuth job status:"
Get-Job -Name AuthService | Select-Object Id,Name,State,HasMoreData | Format-Table -AutoSize
Write-Output "Payment job status:"
Get-Job -Name PaymentService | Select-Object Id,Name,State,HasMoreData | Format-Table -AutoSize

Write-Output "To view logs: Receive-Job -Name AuthService -Keep; Receive-Job -Name PaymentService -Keep"
