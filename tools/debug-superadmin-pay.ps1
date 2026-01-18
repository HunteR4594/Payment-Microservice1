$auth='http://localhost:6000'
$pay='http://localhost:5001'
try {
    $t = Invoke-RestMethod -Method Post -Uri "$auth/api/auth/login" -Body (@{ email='superadmin@fooddelivery.com'; password='Admin123!' } | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    $token = $t.user.token
} catch { Write-Output 'Superadmin login failed'; exit 1 }

try {
    $r = Invoke-RestMethod -Method Get -Uri "$pay/api/refunds" -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
    $r | ConvertTo-Json -Compress | Write-Output
} catch {
    Write-Output 'Admin refunds failed:'
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) { $s = $_.Exception.Response.GetResponseStream(); $rdr = New-Object System.IO.StreamReader($s); $rdr.ReadToEnd() | Write-Output }
}
$authUrl='http://localhost:6000'
$payUrl='http://localhost:5001'
$login=@{ email='superadmin@fooddelivery.com'; password='Admin123!' } | ConvertTo-Json
try {
    $lresp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body $login -ContentType 'application/json' -ErrorAction Stop
    $token=$lresp.user.token
    Write-Output "Super token length: $($token.Length)"
    $ptest = Invoke-RestMethod -Method Get -Uri "$payUrl/protected-test" -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
    Write-Output "Protected-test response:"
    $ptest | ConvertTo-Json -Compress
} catch {
    Write-Output "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) { try { $stream=$_.Exception.Response.GetResponseStream(); $r=New-Object System.IO.StreamReader($stream); $body=$r.ReadToEnd(); Write-Output 'Response body:'; Write-Output $body } catch {} }
}
