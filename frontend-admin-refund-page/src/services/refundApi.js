/**
 * Admin Refund API Service
 * Connects to backend_admin_refund API on port 5003
 */

// Use proxy in development (vite will forward /api to localhost:5003)
const API_BASE_URL = '/api';

/**
 * Get all refund requests
 */
export const getAllRefunds = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/refunds`);
    if (!response.ok) {
      throw new Error(`Failed to fetch refunds: ${response.status}`);
    }
    const data = await response.json();
    // Transform backend data to match frontend format
    return data.map(transformRefundFromBackend);
  } catch (error) {
    console.error('Error fetching refunds:', error);
    throw error;
  }
};

/**
 * Get refund by ID
 */
export const getRefundById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/refunds/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch refund: ${response.status}`);
    }
    const data = await response.json();
    return transformRefundFromBackend(data);
  } catch (error) {
    console.error('Error fetching refund:', error);
    throw error;
  }
};

/**
 * Get refunds by status
 */
export const getRefundsByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/refunds/status/${status}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch refunds by status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(transformRefundFromBackend);
  } catch (error) {
    console.error('Error fetching refunds by status:', error);
    throw error;
  }
};

/**
 * Review (approve/reject) a refund request
 */
export const reviewRefund = async (id, action, adminNotes, rejectionReason) => {
  try {
    const response = await fetch(`${API_BASE_URL}/refunds/${id}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action, // 'approve' or 'reject'
        adminNotes: adminNotes,
        rejectionReason: rejectionReason,
        reviewedBy: 'Admin'
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to review refund: ${response.status}`);
    }
    const data = await response.json();
    return transformRefundFromBackend(data);
  } catch (error) {
    console.error('Error reviewing refund:', error);
    throw error;
  }
};

/**
 * Contact customer about refund
 */
export const contactCustomer = async (refundId, subject, message, contactMethod = 'email') => {
  try {
    const response = await fetch(`${API_BASE_URL}/refunds/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refundId: refundId,
        subject: subject,
        message: message,
        contactMethod: contactMethod
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to contact customer: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error contacting customer:', error);
    throw error;
  }
};

/**
 * Get refund statistics
 */
export const getRefundStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/refunds/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

/**
 * Transform backend refund data to frontend format
 */
const statusMap = {
  0: 'pending',
  1: 'underreview', 
  2: 'approved',
  3: 'rejected',
  4: 'completed'
};

const transformRefundFromBackend = (backendRefund) => {
  // Convert numeric status to string
  const statusValue = typeof backendRefund.status === 'number' 
    ? statusMap[backendRefund.status] || 'pending'
    : backendRefund.status.toLowerCase();
    
  return {
    id: backendRefund.id,
    ticketNumber: backendRefund.orderId,
    name: backendRefund.customerName,
    issueType: backendRefund.category,
    dateSubmitted: new Date(backendRefund.createdAt).toISOString().split('T')[0],
    status: statusValue,
    description: backendRefund.reason,
    photo: 'https://via.placeholder.com/300x200',
    orderDetails: {
      items: [
        { id: 1, name: 'Order Items', price: backendRefund.amount, quantity: 1 }
      ],
      total: backendRefund.amount
    },
    customer: {
      name: backendRefund.customerName,
      email: backendRefund.customerEmail,
      phoneNumber: backendRefund.customerPhone
    },
    adminComment: backendRefund.adminNotes,
    rejectionReason: backendRefund.rejectionReason
  };
};

export default {
  getAllRefunds,
  getRefundById,
  getRefundsByStatus,
  reviewRefund,
  contactCustomer,
  getRefundStats
};
