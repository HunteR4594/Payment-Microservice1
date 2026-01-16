// Unified API Service for Payment Microservice
// Uses relative URLs to go through Vite proxy

const API_BASE_URL = '/api';
const API_TIMEOUT = 5000; // 5 second timeout

// Helper function for API calls with timeout
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error(`API Timeout [${endpoint}]: Request took longer than ${API_TIMEOUT}ms`);
      throw new Error('Request timed out - backend may be unavailable');
    }
    
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Wallet API
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

// Top-up API
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

// Orders API
export const ordersApi = {
  getAll: (userId = 'user_001') => 
    apiCall(`/orders?userId=${userId}`),
  
  getById: (orderId) => 
    apiCall(`/orders/${orderId}`),
  
  create: (items, paymentMethod, voucherCode = null, coinsToUse = 0, branch = 'Main Branch') =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify({ 
        items, 
        paymentMethod, 
        voucherCode, 
        branch 
      }),
    }),

  complete: (orderId) =>
    apiCall(`/orders/${orderId}/complete`, { method: 'POST' }),
};

// Vouchers API
export const vouchersApi = {
  getAll: async () => {
    const res = await apiCall('/vouchers');
    // backend returns wrapper { Success, Data, Total } while dev fallback returns array
    if (Array.isArray(res)) return res;
    return res?.Data ?? res?.data ?? [];
  },
  
  apply: (requestData) =>
    apiCall('/vouchers/apply', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }),
};

// Refund API
export const refundApi = {
  getAll: (userId = 'user1') =>
    apiCall(`/refunds?userId=${userId}`),
  
  getById: (refundId) =>
    apiCall(`/refunds/${refundId}`),
  
  create: async (refundData) => {
    return apiCall('/refunds', {
      method: 'POST',
      body: JSON.stringify({
        orderId: refundData.orderId,
        reason: refundData.reason,
        description: refundData.description,
        customerName: refundData.customerName || 'Customer',
      }),
    });
  },
};

// Admin Refund API
export const adminRefundApi = {
  getAll: async (status = null) => {
    const query = status ? `?status=${status}` : '';
    const data = await apiCall(`/refunds${query}`);
    return data.map(r => ({
      id: r.id,
      ticketNumber: r.orderId || `REF-${r.id?.substring(0, 6)}`,
      orderId: r.orderId,
      userId: r.userId,
      name: r.customerName,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      issueType: r.reason,
      reason: r.reason,
      category: r.category,
      amount: r.amount,
      status: typeof r.status === 'string' ? r.status.toLowerCase() : 
              ['pending', 'underreview', 'approved', 'rejected', 'completed'][r.status] || 'pending',
      dateSubmitted: r.createdAt,
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

  approveAndCreditWallet: (refundId, adminNotes) =>
    apiCall(`/refunds/${refundId}/approve-and-process`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'approve',
        adminNotes,
        reviewedBy: 'Admin'
      }),
    }),
};

// Payment API (for checkout)
export const paymentApi = {
  getMethods: async () => {
    try {
      return await apiCall('/payments/methods');
    } catch {
      return ['card', 'gcash', 'paymaya', 'grab_pay'];
    }
  },
  
  createCheckout: (paymentRequest) =>
    apiCall('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(paymentRequest),
    }),
};

// Named exports for convenience
export const getPaymentMethods = paymentApi.getMethods;
export const createPaymentCheckout = paymentApi.createCheckout;
export const redirectToCheckout = (url) => url && window.open(url, '_blank');

export const getVouchers = vouchersApi.getAll;
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

export const getAllRefunds = adminRefundApi.getAll;
export const reviewRefund = adminRefundApi.review;

export const createRefund = (refundData) =>
  apiCall('/refund', {
    method: 'POST',
    body: JSON.stringify(refundData),
  });

export const uploadRefundPhotoForRefund = async (refundId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/refund/${refundId}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload photo');
  return response.json();
};

export default {
  wallet: walletApi,
  topUp: topUpApi,
  orders: ordersApi,
  vouchers: vouchersApi,
  refund: refundApi,
  adminRefund: adminRefundApi,
  payment: paymentApi,
};
