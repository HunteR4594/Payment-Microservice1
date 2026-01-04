const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
}

// Wallet API
export const walletApi = {
  getWallet: (userId = 'user_001') => 
    apiCall(`/wallet?userId=${userId}`),
  
  getTransactions: (userId = 'user_001', limit = 10) => 
    apiCall(`/wallet/transactions?userId=${userId}&limit=${limit}`),
};

// Top-up API
export const topUpApi = {
  create: (amount, paymentMethod, userId = 'user_001') =>
    apiCall(`/topup?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod }),
    }),
  
  getById: (topUpId) => 
    apiCall(`/topup/${topUpId}`),
  
  getAll: (userId = 'user_001', limit = 10) => 
    apiCall(`/topup?userId=${userId}&limit=${limit}`),
  
  complete: (topUpId) =>
    apiCall(`/topup/${topUpId}/complete`, { method: 'POST' }),
  
  fail: (topUpId) =>
    apiCall(`/topup/${topUpId}/fail`, { method: 'POST' }),
};

// Orders API
export const ordersApi = {
  create: (items, branch, voucherCode = null, userId = 'user_001') =>
    apiCall(`/orders?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ items, branch, voucherCode }),
    }),
  
  getById: (orderId) => 
    apiCall(`/orders/${orderId}`),
  
  getAll: (userId = 'user_001', limit = 10) => 
    apiCall(`/orders?userId=${userId}&limit=${limit}`),
};

// Vouchers API
export const vouchersApi = {
  getAll: () => 
    apiCall('/vouchers'),
  
  getByCode: (code) => 
    apiCall(`/vouchers/${code}`),
  
  apply: (code, orderAmount) =>
    apiCall('/vouchers/apply', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount }),
    }),
};

export default {
  wallet: walletApi,
  topUp: topUpApi,
  orders: ordersApi,
  vouchers: vouchersApi,
};
