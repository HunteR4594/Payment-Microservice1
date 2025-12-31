/**
 * Voucher API Service
 * Handles all communication with the backend voucher endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch all available vouchers
 * @returns {Promise<Array>} Array of voucher objects
 */
export const getVouchers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vouchers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
};

/**
 * Redeem a voucher by code
 * @param {string} code - Voucher code to redeem
 * @returns {Promise<Object>} Voucher object if found
 */
export const redeemVoucher = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to redeem voucher: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    throw error;
  }
};

/**
 * Apply a voucher to an order
 * @param {number} voucherId - Voucher ID to apply
 * @param {number} orderTotal - Current order total
 * @returns {Promise<Object>} Response with discount details
 */
export const applyVoucher = async (voucherId, orderTotal) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voucherId, orderTotal }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to apply voucher: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error applying voucher:', error);
    throw error;
  }
};

/**
 * Mark a voucher as used
 * @param {number} voucherId - Voucher ID to mark as used
 * @returns {Promise<Object>} Updated voucher object
 */
export const useVoucher = async (voucherId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/use/${voucherId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to use voucher: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error using voucher:', error);
    throw error;
  }
};
