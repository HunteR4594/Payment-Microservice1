$authUrl='http://localhost:6000'
Try {
    $resp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body (@{ email='superadmin@fooddelivery.com'; password='Admin123!' } | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    $token = $resp.user.token
    Write-Output '---TOKEN---'
    Write-Output $token
    $parts = $token.Split('.')
    if ($parts.Count -lt 2) { Write-Output 'Token format unexpected'; exit 1 }
    $payload = $parts[1]
    $b64 = $payload.Replace('-','+').Replace('_','/')
    switch ($b64.Length % 4) { 0 { } 2 { $b64 += '==' } 3 { $b64 += '=' } default { $b64 += '===' } }
    $json = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
    Write-Output '---CLAIMS---'
    Write-Output $json
} Catch {
    Write-Output 'Login/Decode failed:'
    Write-Output $_.Exception.Message
    exit 1
}
$authUrl='http://localhost:6000'
Try {
    $resp = Invoke-RestMethod -Method Post -Uri "$authUrl/api/auth/login" -Body (@{ email='superadmin@fooddelivery.com'; password='Admin123!' } | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
    $token = $resp.user.token
    Write-Output '---TOKEN---'
    Write-Output $token
    $parts = $token.Split('.')
    if ($parts.Count -lt 2) { Write-Output 'Token format unexpected'; exit 1 }
    $payload = $parts[1]
    $b64 = $payload.Replace('-','+').Replace('_','/')
    switch ($b64.Length % 4) { 0 { } 2 { $b64 += '==' } 3 { $b64 += '=' } default { $b64 += '===' } }
    $json = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
    Write-Output '---CLAIMS---'
    Write-Output $json
} Catch {
    Write-Output 'Login/Decode failed:'
    Write-Output $_.Exception.Message
    exit 1
}
