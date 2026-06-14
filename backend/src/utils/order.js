const crypto = require('crypto');

/**
 * Generate a unique order number.
 * Format: YYYYMMDD + random hex (uppercase)
 * @returns {string} Unique order number, e.g., "20240614A3F8B2C1"
 */
function generateOrderNo() {
  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${dateStr}${random}`;
}

module.exports = { generateOrderNo };
