const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a JWT token for a given user payload.
 * @param {Object} payload - User data to encode in the token (e.g., { id, username })
 * @returns {string} Signed JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - The JWT token string
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
