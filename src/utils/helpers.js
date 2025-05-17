/**
 * Helper utility functions for the application
 */

/**
 * Validate an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} - true if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format error for logging or response
 * @param {Error} error - Error object
 * @returns {Object} - Formatted error object
 */
export const formatError = (error) => {
  return {
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
};

/**
 * Generate a random string
 * @param {number} length - Length of the random string
 * @returns {string} - Random string
 */
export const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Check if a string is safe (no XSS, injection, etc.)
 * @param {string} str - String to check
 * @returns {boolean} - true if safe, false otherwise
 */
export const isSafeString = (str) => {
  // Simple check for potential script or SQL injection patterns
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /--/g,
    /;/g,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /delete\s+from/gi,
    /update\s+\w+\s+set/gi
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(str));
};

export default {
  isValidEmail,
  formatError,
  generateRandomString,
  isSafeString
};