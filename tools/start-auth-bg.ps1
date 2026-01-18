Start-Job -Name AuthService -ScriptBlock {
    Set-Location 'c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\Auth_service\Online-Food-Delivery-System-Authentication--Backend-Carlos'
    $env:ASPNETCORE_ENVIRONMENT='Development'
    $env:ASPNETCORE_URLS='http://localhost:6000'
    $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'
    dotnet run --project .\FoodDeliverySystem.Auth.csproj --urls http://localhost:6000
}
$up = $false
for ($i=0; $i -lt 30; $i++) {
    try {
        Invoke-RestMethod -Uri 'http://localhost:6000/api/health' -TimeoutSec 2
        $up = $true
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}
if ($up) { Write-Output 'Auth is up' } else { Write-Output 'Auth failed to start'; Receive-Job -Name AuthService -Keep }
Start-Job -Name AuthService -ScriptBlock {
    Set-Location 'c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\Auth_service\Online-Food-Delivery-System-Authentication--Backend-Carlos'
    $env:ASPNETCORE_ENVIRONMENT='Development'
    $env:ASPNETCORE_URLS='http://localhost:6000'
    $env:JwtSettings__Secret='YourSuperSecretKeyHereAtLeast32CharactersLong!'
    dotnet run --project .\FoodDeliverySystem.Auth.csproj --urls http://localhost:6000
}
$up = $false
for ($i=0; $i -lt 30; $i++) {
    try {
        Invoke-RestMethod -Uri 'http://localhost:6000/api/health' -TimeoutSec 2
        $up = $true
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}
if ($up) { Write-Output 'Auth is up' } else { Write-Output 'Auth failed to start'; Receive-Job -Name AuthService -Keep }
