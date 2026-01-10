# Payment-Microservice1
A payment microservice for Kapebara. A food delivery system created by BSIT 3-2 A.Y. 2526.

---

## 📁 Project Structure Overview

This workspace contains multiple microservices (backends) and their corresponding frontend applications for the Kapebara payment system.

| Folder | Type | Port | Description |
|--------|------|------|-------------|
| `backend_admin_refund` | .NET API | 5003 | Admin panel API for managing refunds |
| `backend_checkoutVoucher` | .NET API | 5259 | Payment checkout & voucher API (PayMongo integration) |
| `backend_walletFeature` | .NET API | 5000 | Wallet, top-up, orders & vouchers API |
| `backend-refund-page` | .NET API | 5284 | Customer refund request API |
| `frontend_checkoutVoucher` | React (Vite) | 5173 | Checkout & voucher UI |
| `frontend_walletFeature` | React (Vite) | 3000 | Wallet management UI |
| `frontend-admin-refund-page` | React (Vite) | 5173 | Admin refund management UI |
| `frontend-refund-page` | React (Vite) | 5173 | Customer refund request UI |

---

## 🔧 Prerequisites

Before running any project, ensure you have the following installed:

- **.NET SDK 8.0+** - [Download](https://dotnet.microsoft.com/download)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)

---

## 🚀 How to Run Each Project

### 1️⃣ backend_admin_refund (Admin Refund API)

**Purpose:** Provides API endpoints for administrators to manage and process refund requests.

**Port:** `http://localhost:5003`

```bash
# Navigate to the folder
cd backend_admin_refund

# Restore dependencies
dotnet restore

# Run the application
dotnet run
```

**Swagger UI:** http://localhost:5003/swagger

---

### 2️⃣ backend_checkoutVoucher (Payment Checkout & Voucher API)

**Purpose:** Handles payment processing via PayMongo integration and voucher management.

**Port:** `http://localhost:5259`

**Setup:**
1. Create a `.env.local` file in the `backend_checkoutVoucher` folder with:
   ```
   PAYMONGO_SECRET=your_paymongo_secret_key
   DB_CONNECTION_STRING=your_database_connection_string
   ```

```bash
# Navigate to the folder
cd backend_checkoutVoucher

# Restore dependencies
dotnet restore

# Run the application
dotnet run
```

**Swagger UI:** http://localhost:5259/swagger

---

### 3️⃣ backend_walletFeature (Wallet API)

**Purpose:** Manages user wallets, top-ups, orders, and vouchers. Supports mock and real PayMongo payments.

**Port:** `http://localhost:5000`

**Configuration:**
- Set `PaymentProvider` to `"Mock"` in `appsettings.json` for simulated payments
- Leave it empty or set to another value for real PayMongo payments

```bash
# Navigate to the folder
cd backend_walletFeature

# Restore dependencies
dotnet restore

# Run the application
dotnet run
```

**Swagger UI:** http://localhost:5000/swagger

---

### 4️⃣ backend-refund-page (Customer Refund API)

**Purpose:** Allows customers to submit refund requests with photo uploads.

**Port:** `http://localhost:5284`

**Configuration:**
- Add your PayMongo secret key in `appsettings.json` under `PayMongo:SecretKey`

```bash
# Navigate to the folder
cd backend-refund-page

# Restore dependencies
dotnet restore

# Run the application
dotnet run
```

**Swagger UI:** http://localhost:5284/swagger

---

### 5️⃣ frontend_checkoutVoucher (Checkout & Voucher UI)

**Purpose:** React frontend for payment checkout and applying vouchers.

**Port:** `http://localhost:5173`

**Backend Required:** `backend_checkoutVoucher` (port 5259)

```bash
# Navigate to the folder
cd frontend_checkoutVoucher

# Install dependencies
npm install

# Run the development server
npm run dev
```

---

### 6️⃣ frontend_walletFeature (Wallet UI)

**Purpose:** React frontend for wallet management, top-ups, and transaction history.

**Port:** `http://localhost:3000`

**Backend Required:** `backend_walletFeature` (port 5000)

```bash
# Navigate to the folder
cd frontend_walletFeature

# Install dependencies
npm install

# Run the development server
npm run dev
```

---

### 7️⃣ frontend-admin-refund-page (Admin Refund UI)

**Purpose:** React frontend for administrators to review and process refund requests.

**Port:** `http://localhost:5173`

**Backend Required:** `backend_admin_refund` (port 5003)

```bash
# Navigate to the folder
cd frontend-admin-refund-page

# Install dependencies
npm install

# Run the development server
npm run dev
```

---

### 8️⃣ frontend-refund-page (Customer Refund UI)

**Purpose:** React frontend for customers to submit refund requests.

**Port:** `http://localhost:5173`

**Backend Required:** `backend-refund-page` (port 5284)

```bash
# Navigate to the folder
cd frontend-refund-page

# Install dependencies
npm install

# Run the development server
npm run dev
```

---

## 🔗 Service Pairings

| Frontend | Backend | Use Case |
|----------|---------|----------|
| `frontend_checkoutVoucher` | `backend_checkoutVoucher` | Payment checkout flow |
| `frontend_walletFeature` | `backend_walletFeature` | Wallet & top-up management |
| `frontend-admin-refund-page` | `backend_admin_refund` | Admin refund processing |
| `frontend-refund-page` | `backend-refund-page` | Customer refund requests |

---

## ⚠️ Important Notes

1. **Run backends before frontends** - The frontends proxy API requests to their corresponding backends.

2. **Port conflicts** - If running multiple frontends simultaneously, they may conflict on port 5173. Change the port in `vite.config.js`:
   ```javascript
   server: {
     port: 5174  // or another available port
   }
   ```

3. **CORS is pre-configured** - All backends allow requests from common frontend ports (5173, 5174, 5175, 3000).

4. **PayMongo API Keys** - For production use, replace test API keys with live keys in the respective configuration files.

---

## 📦 Building for Production

### Backend (.NET)
```bash
cd <backend_folder>
dotnet publish -c Release
```

### Frontend (React)
```bash
cd <frontend_folder>
npm run build
npm run preview  # To preview the production build
```

---

## 🛠️ Development Commands Summary

| Command | Description |
|---------|-------------|
| `dotnet restore` | Restore .NET dependencies |
| `dotnet run` | Run .NET application |
| `dotnet watch run` | Run with hot reload |
| `npm install` | Install Node.js dependencies |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
