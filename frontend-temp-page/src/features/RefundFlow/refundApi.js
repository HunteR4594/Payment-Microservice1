// Utility functions for refund API calls
const API_BASE = "http://localhost:5284/api/refund";

// Upload refund photo
export async function uploadRefundPhoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload photo');
  return res.json();
}

// Upload photo for a specific refund
export async function uploadRefundPhotoForRefund(refundId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/${refundId}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload photo');
  return res.json();
}

// Create a refund request (pending status, for manual approval)
export async function createRefund({ paymentId, amount, reason, notes }) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId, amount, reason, notes })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create refund");
  }
  return res.json();
}

// Create and immediately process a refund through PayMongo
export async function createAndProcessRefund({ paymentId, amount, reason, notes }) {
  const res = await fetch(`${API_BASE}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId, amount, reason, notes })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to process refund");
  }
  return res.json();
}

// Process a pending refund through PayMongo
export async function processRefund(refundId) {
  const res = await fetch(`${API_BASE}/${refundId}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to process refund");
  }
  return res.json();
}

export async function getRefunds() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch refunds");
  return res.json();
}

export async function updateRefundStatus(id, status) {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(status)
  });
  if (!res.ok) throw new Error("Failed to update refund status");
  return res;
}

export async function getRefundById(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch refund");
  return res.json();
}
