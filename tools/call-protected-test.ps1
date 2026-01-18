$auth='http://localhost:6000'
$pay='http://localhost:5001'
$email = 'e2e@example.com'
$pw = 'P@ssw0rd!'
Try {
    $l = Invoke-RestMethod -Method Post -Uri "$auth/api/auth/login" -Body (@{ email=$email; password=$pw } | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    $token = $l.user.token
    Write-Output "JWT: $token"
    $ptest = Invoke-RestMethod -Method Get -Uri "$pay/protected-test" -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
    Write-Output 'Protected response:'
    $ptest | ConvertTo-Json -Compress | Write-Output
} Catch {
    Write-Output 'Error:'
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) { try { $s = $_.Exception.Response.GetResponseStream(); $r = New-Object System.IO.StreamReader($s); $r.ReadToEnd() | Write-Output } catch {} }
}
$authUrl='http://localhost:6000'
$payUrl='http://localhost:5001'
$login = @{ email='e2e@example.com'; password='P@ssw0rd!' } | ConvertTo-Json
try {
    $lresp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body $login -ContentType 'application/json' -ErrorAction Stop
    $token = $lresp.user.token
    Write-Output "JWT: $token"
    $ptest = Invoke-RestMethod -Method Get -Uri "$payUrl/protected-test" -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
    Write-Output "Protected response:"
    $ptest | ConvertTo-Json -Compress
} catch {
    Write-Output "Error: $($_.Exception.Message)"
    exit 1
}
