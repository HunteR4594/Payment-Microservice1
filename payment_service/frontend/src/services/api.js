// Unified API Service for Payment Microservice
// Uses relative URLs to go through Vite proxy (see vite.config.js)

const API_BASE_URL = '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  let userId = 'user_001';
  let role = 'user';

  try {
    userId = window.localStorage.getItem('ps_userId') || userId;
    role = (window.localStorage.getItem('ps_role') || role).toLowerCase();
  } catch {
    // ignore
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'X-User-Id': userId,
      'X-User-Role': role,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

// Helper for multipart/form-data calls (do NOT set Content-Type; browser will set boundary)
async function apiCallForm(endpoint, formData, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  let userId = 'user_001';
  let role = 'user';

  try {
    userId = window.localStorage.getItem('ps_userId') || userId;
    role = (window.localStorage.getItem('ps_role') || role).toLowerCase();
  } catch {
    // ignore
  }

  const response = await fetch(url, {
    method: 'POST',
    ...options,
    headers: {
      ...options.headers,
      'X-User-Id': userId,
      'X-User-Role': role,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

// ============ Wallet API ============
// Backend: GET /api/wallet (uses query param)
//          GET /api/wallet/{userId}
//          PUT /api/wallet/{userId}/balance
//          POST /api/wallet/{userId}/use-coins
export const walletApi = {
  getWallet: (userId = 'user_001') => 
    apiCall(`/wallet?userId=${userId}`),
  
  getTransactions: (userId = 'user_001', limit = 10) =>
    apiCall(`/wallet/transactions?userId=${userId}&limit=${limit}`),
  
  updateBalance: (userId = 'user_001', amount, description = '') =>
    apiCall(`/wallet/${userId}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ amount, description }),
    }),
  
  useCoins: (userId = 'user_001', amount) =>
    apiCall(`/wallet/${userId}/use-coins`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
};

// ============ Top-up API ============
// Backend: GET /api/topup
//          GET /api/topup/{id}
//          POST /api/topup
//          POST /api/topup/{id}/complete
//          POST /api/topup/{id}/fail
export const topUpApi = {
  getAll: (userId = 'user_001') => 
    apiCall(`/topup?userId=${userId}`),
  
  getById: (topUpId) => 
    apiCall(`/topup/${topUpId}`),
  
  create: (amount, paymentMethod) =>
    apiCall('/topup', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod }),
    }),
  
  complete: (topUpId) =>
    apiCall(`/topup/${topUpId}/complete`, { method: 'POST' }),
  
  fail: (topUpId) =>
    apiCall(`/topup/${topUpId}/fail`, { method: 'POST' }),
};

// ============ Orders API ============
// Backend: GET /api/orders
//          GET /api/orders/{id}
//          POST /api/orders
//          POST /api/orders/{id}/complete
export const ordersApi = {
  getAll: (userId = 'user_001') => 
    apiCall(`/orders?userId=${userId}`),
  
  getById: (orderId) => 
    apiCall(`/orders/${orderId}`),

  // Pay an existing order (wallet payments complete immediately)
  pay: (orderId, paymentMethod, voucherCode = null, coinsToUse = 0) =>
    apiCall(`/orders/${orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify({
        paymentMethod,
        voucherCode,
        coinsToUse,
      }),
    }),
  
  create: (items, paymentMethod, voucherCode = null, coinsToUse = 0, branch = 'Main Branch', address = null) =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify({ 
        items, 
        paymentMethod, 
        voucherCode, 
        coinsToUse,
        branch,
        // Optional delivery address object: { name, phone, line, city, postalCode }
        address,
      }),
    }),

  complete: (orderId) =>
    apiCall(`/orders/${orderId}/complete`, { method: 'POST' }),
};

// ============ Vouchers API ============
// Backend: GET /api/vouchers
//          POST /api/vouchers/apply
export const vouchersApi = {
  getAll: async () => {
    const res = await apiCall('/vouchers');
    if (Array.isArray(res)) return res;
    return res?.Data ?? res?.data ?? [];
  },
  
  // Accept one object instead of two arguments
  apply: (requestData) =>
    apiCall('/vouchers/apply', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }),
};

// Convenience wrappers for legacy exports
export const getVouchers = async () => {
  return await vouchersApi.getAll();
};

export const redeemVoucher = async (code) => {
  const res = await apiCall('/vouchers/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return res?.Data ?? res?.data ?? res;
};

export const applyVoucher = async (voucherId, orderTotal) => {
  const res = await apiCall('/vouchers/apply', {
    method: 'POST',
    body: JSON.stringify({ voucherId, orderTotal }),
  });
  return res?.Data ?? res?.data ?? res;
};

// ============ Refund API ============
// Backend: GET /api/refunds
//          GET /api/refunds/{id}
//          POST /api/refunds
//          PUT /api/refunds/{id}/review
export const refundApi = {
  // User-scoped refund list
  getAll: (userId = 'user_001') =>
    apiCall(`/refunds/user/${userId}`),
  
  getById: (refundId) =>
    apiCall(`/refunds/${refundId}`),
  
  create: async (refundData) => {
    return apiCall('/refunds', {
      method: 'POST',
      body: JSON.stringify({
        userId: refundData.userId || 'user_001',
        orderId: refundData.orderId,
        customerName: refundData.customerName,
        customerEmail: refundData.customerEmail,
        customerPhone: refundData.customerPhone,
        amount: Number(refundData.amount || 0),
        reason: refundData.reason,
        category: refundData.category,
      }),
    });
  },

  createWithPhoto: async (formData) => {
    return apiCallForm('/refunds/with-photo', formData);
  },
};

// ============ Dashboard API ============
// Backend: GET /api/dashboard/stats
export const dashboardApi = {
  getStats: (userId = 'user_001') =>
    apiCall(`/dashboard/stats?userId=${userId}`),
};

// ============ Order Integration API ============
// Backend: GET /api/order-integration/orders/{orderId}
//          GET /api/order-integration/users/{userId}/pending-count
export const orderIntegrationApi = {
  getOrder: (orderId) => apiCall(`/order-integration/orders/${orderId}`),
  getPendingCount: (userId = 'user_001') => apiCall(`/order-integration/users/${userId}/pending-count`),
};

// ============ Admin Refund API ============
// Backend: GET /api/refunds (all refunds)
//          PUT /api/refunds/{id}/review
//          POST /api/refunds/{id}/approve-and-process (approve + credit wallet)
export const adminRefundApi = {
  getAll: async (status = null) => {
    const query = status ? `?status=${status}` : '';
    const data = await apiCall(`/refunds${query}`);
    // Transform backend format to frontend format
    return data.map(r => ({
      id: r.id,
      ticketNumber: r.orderId || `REF-${r.id?.substring(0, 6)}`,
      orderId: r.orderId,
      userId: r.userId,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      reason: r.reason,
      category: r.category,
      amount: r.amount,
      status: typeof r.status === 'string' ? r.status.toLowerCase() : 
              ['pending', 'underreview', 'approved', 'rejected', 'completed'][r.status] || 'pending',
      createdAt: r.createdAt,
      walletCredited: r.walletCredited || false,
    }));
  },
  
  getById: (refundId) =>
    apiCall(`/refunds/${refundId}`),
  
  review: (refundId, action, adminNotes, rejectionReason) =>
    apiCall(`/refunds/${refundId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ 
        action, 
        adminNotes, 
        rejectionReason,
        reviewedBy: 'Admin'
      }),
    }),

  processToWallet: (refundId) =>
    apiCall(`/refunds/${refundId}/process`, {
      method: 'POST',
    }),
};

export default {
  dashboard: dashboardApi,
  orderIntegration: orderIntegrationApi,
  wallet: walletApi,
  topUp: topUpApi,
  orders: ordersApi,
  vouchers: vouchersApi,
  refund: refundApi,
  adminRefund: adminRefundApi,
};
