# Mock Auth Service

A simple mock authentication service for the Payment Service.

## Quick Start

### 1. Start Backend (C#)
```bash
cd payment_service/mock_auth/backend
dotnet run
```
- Runs on: http://localhost:5300
- Swagger: http://localhost:5300/swagger

### 2. Start Frontend (Vite)
```bash
cd payment_service/mock_auth/frontend
npm run dev
```
- Runs on: http://localhost:3001

## Test Users
| Email | Password | Role |
|-------|----------|------|
| user@example.com | password123 | user |
| admin@example.com | admin123 | admin |

## Flow
1. Open http://localhost:3001
2. Login or Sign up
3. Automatically redirects to Payment Service with token
