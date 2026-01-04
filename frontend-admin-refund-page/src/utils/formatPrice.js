/**
 * Formats a price value to Philippine Peso (₱) currency format
 * @param {number} price - The price value to format
 * @returns {string} Formatted price string (e.g., "₱25.00")
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '₱0.00';
  }
  return `₱${price.toFixed(2)}`;
};

