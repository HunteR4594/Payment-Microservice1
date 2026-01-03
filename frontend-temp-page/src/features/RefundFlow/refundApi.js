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
// Utility functions for refund API calls
const API_BASE = "http://localhost:5284/api/refund";

export async function createRefund({ amount, reason }) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, reason })
  });
  if (!res.ok) throw new Error("Failed to create refund");
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
