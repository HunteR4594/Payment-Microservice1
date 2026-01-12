# Payment Service (Unified)

This is the unified payment service that integrates all payment-related features:

- **Wallet Feature**: Wallet balance, top-up, transactions
- **Checkout & Vouchers**: Order checkout, voucher management
- **Refund**: Customer refund requests
- **Admin Refund**: Admin refund management

## Structure

```
payment_service/
├── frontend/          # React + Vite unified frontend
│   ├── src/
│   │   ├── layouts/   # MainLayout with sidebar navigation
│   │   ├── pages/     # Feature pages
│   │   │   ├── wallet/     # Wallet, TopUp, Orders
│   │   │   ├── checkout/   # Checkout, Vouchers
│   │   │   ├── refund/     # Customer refund requests
│   │   │   └── admin/      # Admin refund management
│   │   ├── components/     # Shared components
│   │   ├── services/       # Unified API service
│   │   └── utils/          # Helper functions
│   └── package.json
│
└── backend/           # ASP.NET Core unified backend
    ├── Controllers/   # API endpoints
    ├── Models/        # Entities and DTOs
    └── Program.cs     # Entry point with CORS
```

## Getting Started

### Backend

```bash
cd payment_service/backend
dotnet restore
dotnet run
```

The API will be available at `http://localhost:5200`

### Frontend

```bash
cd payment_service/frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wallet/{userId}` | GET | Get wallet details |
| `/api/wallet/{userId}/balance` | PUT | Update wallet balance |
| `/api/wallet/{userId}/use-coins` | POST | Use coins from wallet |
| `/api/topup` | GET/POST | List/Create top-ups |
| `/api/topup/{id}` | GET | Get top-up details |
| `/api/topup/{id}/complete` | PUT | Mark top-up complete |
| `/api/orders` | GET/POST | List/Create orders |
| `/api/orders/{id}` | GET | Get order details |
| `/api/vouchers` | GET | List available vouchers |
| `/api/vouchers/apply` | POST | Apply voucher to order |
| `/api/refunds` | GET/POST | List/Create refund requests |
| `/api/refunds/{id}` | GET | Get refund details |
| `/api/refunds/{id}/review` | PUT | Admin review refund |

## Features

### Sidebar Navigation
- Dashboard with quick stats
- Wallet section (balance, top-up, orders)
- Checkout section (checkout, vouchers)
- Refund section (request refund)
- Admin section (manage refunds)

### Wallet Feature
- View wallet balance and coins
- Top-up wallet with multiple payment methods
- View recent orders and top-up history
- Use coins for discounts

### Checkout Feature
- Multiple payment methods (GCash, Maya, Card, Wallet)
- Apply vouchers for discounts
- Use coins for additional savings
- Order summary

### Refund Feature
- Submit refund requests with reason
- Upload supporting photos
- Track refund status

### Admin Feature
- View all refund requests
- Filter by status (pending, approved, rejected)
- Approve or reject with comments
