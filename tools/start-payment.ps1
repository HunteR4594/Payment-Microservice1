Set-Location 'c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\payment_service\backend'
$env:ASPNETCORE_ENVIRONMENT='Production'
$env:ASPNETCORE_URLS='http://localhost:5001'
$env:JWT_SECRET='YourSuperSecretKeyHereAtLeast32CharactersLong!'
dotnet run --no-launch-profile --project .\PaymentService.csproj --urls http://localhost:5001
Set-Location 'c:\Users\renren\Documents\3rd yr\webdev\trydemo1\Payment-Microservice1\payment_service\backend'
# Run in Production to skip EF migrations during local tests when LocalDB isn't available
$env:ASPNETCORE_ENVIRONMENT='Production'
$env:ASPNETCORE_URLS='http://localhost:5001'
$env:JWT_SECRET='YourSuperSecretKeyHereAtLeast32CharactersLong!'
dotnet run --no-launch-profile --project .\PaymentService.csproj --urls http://localhost:5001
