import React from 'react';
import { Badge } from 'react-bootstrap';

/**
 * Status badge variant lookup object
 * Maps status strings to Bootstrap badge variants
 */
export const STATUS_VARIANTS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  proving: 'info',
};

/**
 * Renders a status badge component
 * @param {string} status - The status string
 * @returns {JSX.Element} Badge component
 */
export const getStatusBadge = (status) => {
  const variant = STATUS_VARIANTS[status] || 'secondary';
  return <Badge bg={variant}>{status.toUpperCase()}</Badge>;
};

