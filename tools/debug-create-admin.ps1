$auth='http://localhost:6000'
$super = @{ email='superadmin@fooddelivery.com'; password='Admin123!' } | ConvertTo-Json
try {
    $t = Invoke-RestMethod -Method Post -Uri "$auth/api/auth/login" -Body $super -ContentType 'application/json' -ErrorAction Stop
    $token = $t.user.token
} catch { Write-Output 'Superadmin login failed'; exit 1 }

$payload = @{ fullName='Dbg Admin'; email='admin-dbg@example.com'; password='Admin123!'; confirmPassword='Admin123!' } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Method Post -Uri "$auth/api/auth/create/admin" -Headers @{ Authorization = "Bearer $token" } -Body $payload -ContentType 'application/json' -ErrorAction Stop
    Write-Output $r | ConvertTo-Json -Compress
} catch {
    Write-Output 'Create admin failed:'
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) { $s = $_.Exception.Response.GetResponseStream(); $r = New-Object System.IO.StreamReader($s); $r.ReadToEnd() | Write-Output }
}
$authUrl = 'http://localhost:6000'

# Login as SuperAdmin
$login = @{ email = 'superadmin@fooddelivery.com'; password = 'Admin123!' } | ConvertTo-Json
try {
    $lresp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body $login -ContentType 'application/json' -ErrorAction Stop
    $token = $lresp.user.token
    Write-Output "SuperAdmin token obtained"
} catch {
    Write-Output "Login failed: $($_.Exception.Message)"
    exit 1
}

# Create admin
$adminEmail = "admin+debug$( [guid]::NewGuid().ToString('N').Substring(0,6) )@example.com"
$payload = @{ fullName = 'Auto Admin'; email = $adminEmail; password = 'Admin123!'; confirmPassword = 'Admin123!' } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/create/admin" -Headers @{ Authorization = "Bearer $token" } -Body $payload -ContentType 'application/json' -ErrorAction Stop
    Write-Output "Create admin succeeded"
    $r | ConvertTo-Json -Compress | Write-Output
} catch {
    Write-Output "Create admin HTTP error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            Write-Output "Response body:"
            Write-Output $body
        } catch {
            Write-Output "Failed reading response body: $($_.Exception.Message)"
        }
    }
    exit 1
}
