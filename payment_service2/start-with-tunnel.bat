@echo off
echo Starting Payment Service 2 with Tunnel...
echo.

:: Set your preferred subdomain
set SUBDOMAIN=kapebara-payment-dev

:: Start tunnel in background
start "Tunnel" cmd /c "lt --port 5201 --subdomain %SUBDOMAIN%"

:: Wait for tunnel to start
timeout /t 3 /nobreak >nul

echo ========================================
echo Tunnel URL: https://%SUBDOMAIN%.loca.lt
echo Webhook:    https://%SUBDOMAIN%.loca.lt/api/payments/webhook
echo ========================================
echo.

:: Start the backend
cd backend
dotnet run --project PaymentService2.csproj
