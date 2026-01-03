/**
 * Payment API Service
 * Handles all communication with the backend payment microservice
 */

// Use VITE_API_BASE (matches .env.local) or fall back to '/api'
const API_BASE_URL = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Normalize path building: ensure path begins with '/'
const joinPath = (base, suffix) => {
  if (!base) base = '';
  if (!suffix) suffix = '';
  return `${base.replace(/\/$/, '')}/${suffix.replace(/^\//, '')}`;
};

// Determine endpoint path based on mock flag
const getEndpoint = (path) => {
  const apiPath = USE_MOCK ? joinPath(API_BASE_URL, `mock${path}`) : joinPath(API_BASE_URL, path);
  return apiPath;
};

/**
 * Fetch available payment methods from backend
 * @returns {Promise<string[]>} Array of payment method types (e.g., ['card', 'gcash', 'paymaya'])
 */
export const getPaymentMethods = async () => {
  try {
    const response = await fetch(getEndpoint('/payments/methods'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payment methods: ${response.status}`);
    }

    const data = await response.json();
    // The backend returns the payment methods array directly
    return data || [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

/**
 * Process a payment request and get checkout URL
 * @param {Object} paymentRequest - Payment request data
 * @param {string} paymentRequest.orderId - Order ID
 * @param {number} paymentRequest.amount - Payment amount in cents
 * @param {string} paymentRequest.description - Payment description
 * @param {string} paymentRequest.paymentMethod - Selected payment method (e.g., 'gcash', 'card')
 * @returns {Promise<string>} PayMongo checkout URL
 */
export const createPaymentCheckout = async (paymentRequest) => {
  try {
    const response = await fetch(getEndpoint('/payments/checkout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: paymentRequest.orderId,
        userId: paymentRequest.userId || '550e8400-e29b-41d4-a716-446655440001', // Default test user
        amount: paymentRequest.amount,
        currency: paymentRequest.currency || 'PHP',
        description: paymentRequest.description,
        paymentMethod: paymentRequest.paymentMethod,
      }),
    });

    if (!response.ok) {
      throw new Error(`Payment checkout failed: ${response.status}`);
    }

    const data = await response.json();
    // Backend returns { checkoutUrl: "..." }
    return data.checkoutUrl;
  } catch (error) {
    console.error('Error creating payment checkout:', error);
    throw error;
  }
};

/**
 * Helper to redirect user to PayMongo checkout
 * @param {string} checkoutUrl - The checkout URL from PayMongo
 */
export const redirectToCheckout = (checkoutUrl) => {
  if (checkoutUrl) {
    window.open(checkoutUrl, '_blank');
  } else {
    console.error('Invalid checkout URL');
  }
};
