# Payment Service 2 - Stored Procedures Architecture

A payment service reimplemented using **ADO.NET + Stored Procedures** instead of Entity Framework.

## Quick Start

### 1. Setup Database
Run the SQL script to create tables and stored procedures:
```sql
-- Open in SSMS and execute:
payment_service2/sql/stored_procedures.sql
```

### 2. Start Backend
```bash
cd payment_service2/backend
dotnet run --project PaymentService2.csproj
```
- Runs on: **http://localhost:5201**
- Swagger: http://localhost:5201/swagger

## Architecture

| Component | Technology |
|-----------|------------|
| Data Access | ADO.NET (SqlClient) |
| Business Logic | Stored Procedures |
| Authentication | JWT Bearer |
| API Docs | Swagger/OpenAPI |

## Stored Procedures

| Procedure | Description |
|-----------|-------------|
| `SP_GetWallet` | Get/create wallet |
| `SP_AddBalance` | Add balance + coins |
| `SP_DeductBalance` | Deduct balance |
| `SP_UseCoins` | Use coins |
| `SP_GetTransactions` | Transaction history |
| `SP_GetVouchers` | List vouchers |
| `SP_ApplyVoucher` | Apply voucher |
| `SP_CreateRefund` | Create refund |
| `SP_ReviewRefund` | Approve/reject |

## Endpoints

- `GET /api/wallet` - Get wallet
- `GET /api/wallet/transactions` - Transaction history
- `GET /api/vouchers` - List vouchers
- `POST /api/vouchers/apply` - Apply voucher
- `GET /api/refunds` - List refunds
- `POST /api/refunds` - Create refund
- `POST /api/topup` - Create top-up
